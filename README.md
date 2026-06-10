# SohojPaath

SohojPaath: An AI-Based Adaptive Software for Neurodiverse Readers.

## Local Setup

You need two terminals — one for the Flask backend, one for the React frontend.

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Set up the Python backend
```bash
pip install -r requirements.txt
```

### 3. Start the Flask server
```bash
venv\Scripts\activate
python dyslexia_api.py
```
The API runs on `http://localhost:5000`. Keep this terminal open.

### 4. Start the frontend
In a second terminal:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

## Features

- **OCR**: Scan printed text from images (EasyOCR — English + Bengali)
- **Web Fetch**: Extract readable text from any URL
- **Adaptive Reading**: Syllable segmentation, bilingual support, customisable fonts and overlays
- **Text-to-Speech & Dictation**: Built-in browser Web Speech API
- **Dyslexia Screening**: Five cognitive games (Track A) + handwriting image analysis (Track B)
- **Bilingual Support**: Optimised for both English and Bengali scripts
