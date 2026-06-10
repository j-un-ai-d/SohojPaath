"""
SohojPaath — Dyslexia Screening API
====================================
Flask backend serving these endpoints:
  GET  /health               – health check
  POST /predict/games        – XGBoost model on 196 game-metric features
  POST /predict/handwriting  – Keras CNN on 224×224 handwriting images
  POST /fetch-url            – fetches and cleans article text from a URL
  POST /ocr                  – EasyOCR image-to-text (English + Bengali)
  POST /segment              – pyphen syllable segmentation (English)

Run:  python dyslexia_api.py
"""

import logging, json, io, os
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# ── logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# ── app ──
app = Flask(__name__)
CORS(app)

# ── load XGBoost model ──
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

log.info("Loading XGBoost model …")
csv_model = joblib.load(os.path.join(MODEL_DIR, "dyslexia_model.pkl"))
EXPECTED_FEATURES = int(csv_model.n_features_in_)  # 196
log.info("XGBoost model loaded — expects %d features", EXPECTED_FEATURES)

with open(os.path.join(MODEL_DIR, "model_config.json"), "r") as f:
    config = json.load(f)
threshold = config.get("threshold", 0.2)

# ── lazy-load Keras model ──
image_model = None

def _load_keras_model():
    h5_path = os.path.join(MODEL_DIR, "dyslexia_image_model.h5")
    log.info("Loading Keras model from %s …", h5_path)
    errors = []

    # attempt 1: Keras 3.x
    try:
        import keras
        model = keras.models.load_model(h5_path, compile=False)
        log.info("Keras model loaded via Keras 3.x — input: %s", model.input_shape)
        return model
    except Exception as e:
        errors.append(f"Keras 3.x: {e}")
        log.warning("Keras 3.x load failed: %s", e)

    # attempt 2: TF Keras
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(h5_path, compile=False)
        log.info("Keras model loaded via TF Keras — input: %s", model.input_shape)
        return model
    except Exception as e:
        errors.append(f"TF Keras: {e}")
        log.warning("TF Keras load failed: %s", e)

    # attempt 3: compat patch for builds where Dense.__init__ lacks quantization_config
    try:
        import keras
        from keras.layers import Dense as _BaseDense

        class _CompatDense(_BaseDense):
            def __init__(self, *args, **kwargs):
                kwargs.pop('quantization_config', None)
                super().__init__(*args, **kwargs)

            @classmethod
            def from_config(cls, config):
                config.pop('quantization_config', None)
                return super().from_config(config)

        model = keras.models.load_model(
            h5_path,
            compile=False,
            custom_objects={'Dense': _CompatDense},
        )
        log.info("Keras model loaded via compatibility patch — input: %s", model.input_shape)
        return model
    except Exception as e:
        errors.append(f"Keras compat patch: {e}")
        log.warning("Keras compat patch failed: %s", e)

    raise RuntimeError(
        "All model loading attempts failed:\n" + "\n".join(errors)
    )


# ── lazy-load EasyOCR reader ──
_ocr_reader = None

def _get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr
        log.info("Loading EasyOCR reader (first request) …")
        _ocr_reader = easyocr.Reader(['en', 'bn'], gpu=False)
        log.info("EasyOCR reader loaded.")
    return _ocr_reader


# ── helpers ──
def _risk_label(probability: float) -> str:
    if probability >= 0.6:
        return "HIGH"
    if probability >= 0.35:
        return "MEDIUM"
    return "LOW"


# ══════════════════════════════════════════════════════════════════════════════
# endpoints
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "model_features": EXPECTED_FEATURES})


# ── POST /predict/games
@app.route("/predict/games", methods=["POST"])
def predict_games():
    log.info("→ /predict/games")

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be JSON with Content-Type: application/json"}), 400

    scores = data.get("scores")
    if scores is None:
        return jsonify({"error": "Missing 'scores' key in JSON body"}), 400
    if not isinstance(scores, list):
        return jsonify({"error": "'scores' must be a list of numbers"}), 400

    n = len(scores)
    if n > EXPECTED_FEATURES:
        return jsonify({"error": f"Too many features: got {n}, model expects {EXPECTED_FEATURES}"}), 400
    if n < EXPECTED_FEATURES:
        log.info("  Padding %d scores → %d", n, EXPECTED_FEATURES)
        scores = scores + [0.0] * (EXPECTED_FEATURES - n)

    try:
        features = np.array(scores, dtype=np.float64).reshape(1, -1)
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Could not convert scores to numeric array: {e}"}), 400

    try:
        probability = float(csv_model.predict_proba(features)[0][1])
    except Exception as e:
        log.exception("Prediction failed")
        return jsonify({"error": f"Model prediction failed: {e}"}), 500

    risk = _risk_label(probability)
    log.info("  Result: risk=%s  probability=%.3f", risk, probability)

    return jsonify({
        "risk_level": risk,
        "probability": round(probability * 100, 3),
    })


# ── POST /predict/handwriting
@app.route("/predict/handwriting", methods=["POST"])
def predict_handwriting():
    log.info("→ /predict/handwriting")

    global image_model
    if image_model is None:
        try:
            image_model = _load_keras_model()
        except Exception as e:
            log.exception("Failed to load Keras model")
            return jsonify({"error": f"Image model failed to load: {e}"}), 500

    if "image" not in request.files:
        return jsonify({"error": "No 'image' file in the request. Use multipart/form-data with key 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename — please select an image."}), 400

    try:
        img = Image.open(io.BytesIO(file.read())).resize((224, 224)).convert("RGB")
        img_array = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)
    except Exception as e:
        return jsonify({"error": f"Could not process image: {e}"}), 400

    try:
        predictions = image_model.predict(img_array, verbose=0)[0]
    except Exception as e:
        log.exception("Image model prediction failed")
        return jsonify({"error": f"Prediction failed: {e}"}), 500

    classes = ["Corrected", "Normal", "Reversal"]
    predicted_class = classes[int(np.argmax(predictions))]
    confidence = round(float(np.max(predictions)) * 100, 1)
    risk = "HIGH" if predicted_class == "Reversal" else "MEDIUM" if predicted_class == "Corrected" else "LOW"

    log.info("  Result: class=%s  confidence=%.1f%%  risk=%s", predicted_class, confidence, risk)

    return jsonify({
        "risk_level": risk,
        "predicted_class": predicted_class,
        "confidence": confidence,
    })


# ── POST /fetch-url
@app.route("/fetch-url", methods=["POST"])
def fetch_url():
    log.info("→ /fetch-url")

    try:
        import requests as req
        from bs4 import BeautifulSoup
    except ImportError:
        return jsonify({"error": "Missing dependencies. Run: pip install requests beautifulsoup4"}), 500

    data = request.get_json(silent=True)
    if not data or not data.get("url", "").strip():
        return jsonify({"error": "Missing 'url' in request body"}), 400

    url = data["url"].strip()
    log.info("  Fetching: %s", url)

    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        response = req.get(url, headers=headers, timeout=12)
        response.raise_for_status()
    except req.exceptions.ConnectionError:
        return jsonify({"error": "Could not reach this URL. Check the address and your internet connection."}), 400
    except req.exceptions.Timeout:
        return jsonify({"error": "The request timed out. The site may be too slow or unreachable."}), 400
    except req.exceptions.HTTPError as e:
        return jsonify({"error": f"The site returned an error: {e}"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to fetch URL: {e}"}), 400

    try:
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "nav", "header", "footer",
                         "aside", "form", "iframe", "noscript", "figure",
                         "figcaption", "button", "input", "select"]):
            tag.decompose()

        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        main = (
            soup.find("article") or
            soup.find("main") or
            soup.find(id="content") or
            soup.find(id="main-content") or
            soup.find(class_="article-body") or
            soup.find(class_="post-content") or
            soup.find(class_="entry-content") or
            soup.body
        )

        if not main:
            main = soup

        raw_text = main.get_text(separator="\n", strip=True)

        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        # skip lines that are likely nav remnants
        lines = [line for line in lines if len(line) > 20]
        cleaned = "\n\n".join(lines)

        if not cleaned:
            return jsonify({"error": "No readable text found on this page. The site may block automated access."}), 400

        log.info("  Extracted %d characters from %s", len(cleaned), url)
        return jsonify({"text": cleaned, "title": title or url})

    except Exception as e:
        log.exception("Content extraction failed")
        return jsonify({"error": f"Could not extract text from the page: {e}"}), 500


# ── POST /ocr
@app.route("/ocr", methods=["POST"])
def ocr():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        file = request.files["image"]
        img = Image.open(io.BytesIO(file.read()))
        img_array = np.array(img)
        reader = _get_ocr_reader()
        results = reader.readtext(img_array, detail=0)
        text = '\n'.join(results)
        if not text.strip():
            return jsonify({"error": "No text found in image"}), 400
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /segment
@app.route("/segment", methods=["POST"])
def segment():
    try:
        import pyphen
        import re
        data = request.get_json(silent=True)
        if not data or not data.get("text"):
            return jsonify({"error": "No text provided"}), 400
        text = data["text"]
        dic = pyphen.Pyphen(lang='en')

        def segment_word(word):
            # splits prefix/core/suffix; keeps apostrophes and hyphens in core
            m = re.match(r"^([^a-zA-Z]*)([a-zA-Z][a-zA-Z'\-]*)([^a-zA-Z]*)$", word)
            if not m:
                return word  # non-word token, leave untouched
            prefix, core, suffix = m.group(1), m.group(2), m.group(3)
            return prefix + dic.inserted(core, hyphen='·') + suffix

        words = text.split()
        segmented = ' '.join(segment_word(w) for w in words)
        return jsonify({"segmentedText": segmented})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── error handlers ──
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET  /health",
            "POST /predict/games",
            "POST /predict/handwriting",
            "POST /fetch-url",
            "POST /ocr",
            "POST /segment",
        ],
    }), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed. Use POST for prediction endpoints."}), 405


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    log.info("Starting SohojPaath Dyslexia API on http://localhost:5000")
    app.run(debug=True, port=5000)
