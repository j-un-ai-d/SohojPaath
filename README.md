# SohojPaath
**An AI-Based Adaptive Software for Neurodiverse Readers.**

---

## 2. Introduction

SohojPaath is an innovative, AI-driven assistive software designed to empower individuals with Dyslexia and other neurodiverse learning conditions. Dyslexia affects the brain's ability to process written language, leading to challenges in reading, spelling, and maintaining focus. SohojPaath bridges this gap by transforming static text into a multi-sensory, highly customizable digital experience. By utilizing Artificial Intelligence (AI) and Machine Learning (ML), the platform adapts to the user's specific cognitive needs rather than forcing the user to adapt to traditional text formats.

---

## 3. Related Project/Background

Existing tools such as Microsoft Immersive Reader, Grammarly, and the OpenDyslexic project have demonstrated the importance of digital accessibility and assistive reading technologies. These solutions offer valuable features such as text-to-speech, grammar assistance, and dyslexia-friendly typography. However, many current tools are fragmented, requiring users to switch between multiple applications for scanning text, adjusting fonts, filtering web content, or accessing speech support.

Additionally, there is a significant lack of localized support for bilingual (English and Bengali) neurodiverse learners, particularly in the South Asian educational context. Most global tools are optimized primarily for English and do not adequately address Bengali orthographic complexity (e.g., conjunct characters and vowel signs). SohojPaath builds upon existing foundations by integrating OCR, AI-driven linguistic processing, bilingual support, distraction filtering, and gamified progress tracking into a single cohesive ecosystem tailored for localized accessibility.

---

## 4. Problem Statement and Idea Description

### 4.1 The Problem

Individuals with dyslexia and related learning differences often experience visual stress, where text appears to blur, shimmer, or distort on high-contrast white backgrounds. Complex web layouts containing advertisements, animations, and multi-column designs can create cognitive overload, making it difficult to focus on core reading material.

In addition, learners frequently struggle with phonological decoding, syllable segmentation, and maintaining reading flow across long-form text. Traditional education systems rarely provide real-time, personalized assistance to accommodate these needs. For bilingual learners (English and Bengali), the challenge increases due to differences in script structure, phonetics, and orthographic rules.

As a result, many neurodiverse learners expend excessive cognitive effort on decoding rather than comprehension, leading to reduced confidence and academic performance.

### 4.2 The Solution

SohojPaath functions as an Intelligent Reading Enhancement Layer that transforms both physical and digital text into an adaptive, accessible format. Users can capture printed material or input web URLs, after which the system processes the content using AI-based text extraction and linguistic analysis.

The platform applies customizable visual modifications (font, spacing, color overlays), provides synchronized text-to-speech support, filters digital distractions, and segments complex words to support phonetic decoding. Instead of forcing users to adapt to rigid text formats, SohojPaath adapts the presentation of content to match the user's cognitive and visual preferences.

---

## 5. Methodology/Implementation/Project Architecture

### 5.1 Methodology (Software Development Life Cycle)

The project follows a structured Software Development Life Cycle (SDLC) to ensure usability, accessibility, performance, and security.

**Requirement Analysis:**
- Identification of literacy challenges such as visual stress, decoding difficulty, working memory strain, and attention regulation.
- Definition of bilingual (English and Bengali) processing requirements, including script-aware syllable segmentation.
- Establishment of performance targets for OCR accuracy and Text-to-Speech (TTS) response time.
- Definition of privacy and data protection requirements for educational users.

**System Design:**
- Design of database schemas to manage user profiles, personalization settings, progress metrics, and authentication tokens.
- Development of UML diagrams describing content flow from input (image or URL) to accessible output.
- Selection of accessible typography, spacing rules, and color palettes aligned with WCAG guidelines.

**Development:**
- Frontend Development: Cross-platform mobile interface built using the Flutter framework for Android and iOS.
- AI Integration: Cloud-based OCR services and language-specific processing modules for English and Bengali.
- Backend Setup: Firebase services for authentication, secure data storage, and real-time synchronization.

**Testing:**
- OCR accuracy testing across varied lighting conditions, print qualities, and Bengali/English fonts.
- Usability testing with representative users to evaluate reading speed, comprehension, and interface clarity.
- Functional testing of distraction filtering across multiple web layouts.
- Security testing for authentication flow and encrypted communication.

---

### 5.2 Implementation

**Frontend (User Interface Layer):**
- **Platform:** Developed using Flutter (Dart) for consistent rendering on Android and iOS.
- **Assistive Rendering Tools:** Custom visual layers for Reading Ruler, Line Focus Mode, adjustable spacing, and color overlays.
- **Accessibility Design:** Minimalist layout with controlled spacing, adjustable typography, and theme customization to reduce cognitive overload.

**AI & Processing Layer:**
- **Text Extraction:** OCR functionality implemented using either Google Vision API or Google ML Kit (final selection based on benchmarking accuracy, Bengali support, latency, and cost).
- **Linguistic Processing:** Script-aware segmentation modules for English syllable splitting and Bengali grapheme-cluster (akshara) segmentation.
- **Content Filtering:** DOM-based content extraction algorithm that isolates primary article content while removing advertisements and navigation clutter.
- **Text-to-Speech:** AI-based speech synthesis with adjustable speed and synchronized word highlighting.

**Data Management & Flow:**
- **Authentication:** Secure login managed via Firebase Authentication, which issues time-limited JWT tokens for session validation.
- **Encryption:** All data transmitted over HTTPS (TLS). Sensitive user data stored in encrypted cloud databases.
- **Persistence:** User preferences, reading history, and progress metrics stored in Firebase Firestore with optional local caching for offline access.
- **Privacy Controls:** Users can delete reading history and export profile data upon request.

**Information Flow:**
1. The user captures a text image or submits a web URL.
2. The processing engine extracts and structures the text.
3. Linguistic modules apply segmentation and accessibility formatting.
4. The frontend renders personalized visual settings.
5. Reading metrics are optionally recorded to update the user's progress dashboard.

---

### 5.3 Project Architecture

SohojPaath employs a Hybrid Client-Server Architecture to balance performance and scalability.

- **Presentation Layer (Client-Side):** Handles visual customization, reading tools, and user interaction.
- **AI Service Layer (Cloud-Based):** Performs OCR processing, advanced linguistic analysis, and high-quality voice synthesis.
- **Persistence Layer:** Firebase Firestore for cloud synchronization and local storage for cached content.
- **Communication Layer:** Secure API gateway managing encrypted data exchange between mobile/web clients and AI services.

---

### 5.4 Target Population

**Primary Users – Neurodiverse Learners:**
- Individuals with dyslexia who experience phonetic decoding challenges and letter confusion.
- Learners with attention-related difficulties who benefit from structured visual focus tools.

**Secondary Users – Bilingual Learners:**
- Students in Bangladesh and similar contexts navigating both English and Bengali academic materials.

**Tertiary Users – General Accessibility:**
- Elderly readers experiencing declining visual acuity.
- Low-vision users who rely on text-to-speech and enlarged typography.

---

### 5.5 Platform

**Mobile Application (Primary Interface):**
- Operating Systems: Android and iOS.
- Technology: Flutter-based cross-platform development.
- Primary Use Case: Scan-to-Read functionality and personalized reading assistance for textbooks and documents.

**Web Extension (Distraction Filtering Module):**
- Browsers: Google Chrome, Microsoft Edge, and Firefox.
- Technology: JavaScript-based DOM content extraction engine.
- Primary Use Case: Real-time removal of advertisements and layout clutter for focused article reading.

**Cloud Backend (The Synchronization Layer):**
- Infrastructure: Firebase (Google Cloud).
- Database Model: NoSQL document storage with real-time sync capability.
- Primary Use Case: Ensures user reading profiles and settings remain consistent across devices.

---

## 6. Project Features

### 6.1 Visual Customization & Focus

- **Dyslexia-Friendly Fonts:** Integration of specialized Latin-script fonts such as OpenDyslexic, alongside carefully selected high-readability Bengali fonts.
- **Adjustable Spacing:** Control over letter spacing, line spacing, and paragraph width.
- **Color Overlays:** Customizable background tints to reduce visual strain.
- **Line Focus Mode:** Surrounding text is dimmed to emphasize the active reading line.
- **Reading Ruler:** Movable guiding strip that helps maintain tracking.
- **Dark Mode and Blue-Light Reduction Themes.**
- **Distraction Filtering Engine:** Removes advertisements and non-essential elements from web pages.

### 6.2 Intelligent AI Processing

- **Optical Character Recognition (OCR):** Converts printed text into editable digital format.
- **Script-Aware Word Segmentation:** English syllable splitting and Bengali grapheme-aware segmentation.
- **Text-to-Speech (TTS):** Adjustable reading speed with synchronized word highlighting.
- **Voice Customization:** Multiple voice profiles to match user comfort preferences.

### 6.3 Writing, Engagement & Tracking

- **Speech-to-Text Dictation:** Enables users to compose text verbally.
- **Gamified Learning Modules:** Interactive reading and spelling challenges with performance-based rewards.
- **Progress Dashboard:** Tracks reading duration, completed sessions, and improvement trends.

---

## 12. Social and Economic Value

The global EdTech sector is increasingly aligned with Universal Design for Learning (UDL). Approximately 1 in 10 individuals are estimated to experience dyslexia-related reading difficulties. Despite this prevalence, localized, bilingual assistive technologies remain limited. SohojPaath addresses this gap by offering an integrated accessibility solution rather than requiring users to combine multiple disconnected tools.

### 12.1 Social Impact

- Reduces cognitive load during reading tasks.
- Promotes academic independence and confidence.
- Expands digital inclusion by making web and printed content more accessible.

### 12.2 Economic Model

- **B2B Institutional Licensing:** Subscription packages for schools and universities.
- **B2C Freemium Model:** Core reading features free; advanced AI features under premium subscription.
- **Workplace Productivity Applications:** Supports inclusive corporate environments.

### 12.3 Scalability

While the current focus is on Dyslexia, the modular nature of SohojPaath allows for easy scaling. The same technology can be adapted for:
- Elderly users with declining vision.
- Language learners (ESL) who need syllable breaking and TTS for pronunciation.
- General users seeking focused reading environments.

---

## 14. Conclusion

SohojPaath is a comprehensive assistive reading platform designed to reduce barriers faced by neurodiverse and bilingual learners. By integrating OCR, adaptive visual tools, bilingual linguistic processing, and synchronized audio support, the system enhances accessibility without altering the original meaning of content.

While technology does not eliminate learning differences, it can significantly reduce structural and environmental barriers. Through thoughtful design, secure architecture, and localized language support, SohojPaath aims to promote inclusive literacy and equitable access to knowledge.
