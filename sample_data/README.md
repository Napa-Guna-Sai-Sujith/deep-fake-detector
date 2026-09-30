# 🧪 Multi-Modal Deepfake & Genuine Test Dataset

This directory contains pre-generated genuine and synthetic/deepfake test files across **Audio**, **Image**, and **Video** modalities for testing and evaluating the DeepFakeShield detection pipeline.

---

## 📁 Directory Structure

```
sample_data/
├── audio/
│   ├── genuine_human_voice.wav      # Natural human voice with natural formants & pitch drift
│   ├── genuine_acoustic_speech.wav  # Clean acoustic recording with organic dynamic range
│   ├── fake_tts_synthesized.wav     # TTS-style robotic voice with quantized pitch grid
│   └── fake_voice_clone.wav         # Neural voice clone deepfake with phase discontinuities
├── images/
│   ├── genuine_portrait_photo.jpg   # Photorealistic portrait with authentic camera noise & skin texture
│   ├── genuine_natural_face.png     # Unmanipulated natural facial rendering
│   ├── fake_ai_generated_face.jpg   # AI synthesized face with GAN checkerboard & subtle distortions
│   └── fake_face_swap_edit.png      # Manipulated face-swap with seam lines & color grading step
└── video/
    ├── genuine_interview_clip.mp4   # 30fps clip with smooth natural eye blinks & organic head motion
    ├── genuine_video_stream.mp4     # Clean temporal consistency video stream
    ├── fake_deepfake_face_swap.mp4  # Deepfake video with facial boundary flickering & jitter
    └── fake_ai_synthetic_talking.mp4# AI avatar clip with lip-sync desynchronization artifacts
```

---

## 🎙️ Audio Test Samples (`sample_data/audio/`)

| File Name | Ground Truth | Duration | Sample Rate | Characteristics |
| :--- | :---: | :---: | :---: | :--- |
| `genuine_human_voice.wav` | **Genuine** | 3.0s | 44.1 kHz | Natural vocal tract resonances (F1, F2, F3), organic micro-vibrato (~140 Hz), breathing noise envelope. |
| `genuine_acoustic_speech.wav` | **Genuine** | 3.0s | 44.1 kHz | Smooth spectral flux, high harmonic ratio, natural voice decay. |
| `fake_tts_synthesized.wav` | **Fake (Deepfake / TTS)** | 3.0s | 44.1 kHz | Quantized fundamental frequency ($F_0$), high spectral flatness, metallic carrier buzz at 4 kHz / 8 kHz. |
| `fake_voice_clone.wav` | **Fake (Voice Clone)** | 3.0s | 44.1 kHz | High-frequency neural vocoder artifacts, 60 Hz jitter, phase discontinuities. |

---

## 🖼️ Image Test Samples (`sample_data/images/`)

| File Name | Ground Truth | Dimensions | Format | Characteristics |
| :--- | :---: | :---: | :---: | :--- |
| `genuine_portrait_photo.jpg` | **Genuine** | $1024 \times 1024$ | JPEG | Authentic human portrait, natural skin pores, realistic specular reflection in pupils, natural camera bokeh. |
| `genuine_natural_face.png` | **Genuine** | $512 \times 512$ | PNG | Natural color distribution, consistent bilateral facial lighting, smooth edge transitions. |
| `fake_ai_generated_face.jpg` | **Fake (AI Synthesis)** | $1024 \times 1024$ | JPEG | AI diffusion generation with uncanny symmetrical pupil reflections, smoothed skin boundaries, digital artifacting around hair borders. |
| `fake_face_swap_edit.png` | **Fake (Face Swap)** | $512 \times 512$ | PNG | Discontinuous boundary seam, mismatched neck-to-face skin tone color matrix, warping artifacts. |

---

## 🎥 Video Test Samples (`sample_data/video/`)

| File Name | Ground Truth | Resolution | FPS | Characteristics |
| :--- | :---: | :---: | :---: | :--- |
| `genuine_interview_clip.mp4` | **Genuine** | $320 \times 240$ | 30 | Smooth optical flow, realistic human blinking cadence (at frame 25), continuous lighting. |
| `genuine_video_stream.mp4` | **Genuine** | $320 \times 240$ | 30 | Consistent inter-frame difference metrics, zero boundary jitter. |
| `fake_deepfake_face_swap.mp4` | **Fake (Face Swap)** | $320 \times 240$ | 30 | High inter-frame edge disparity, facial bounding box flickering, temporal jittering. |
| `fake_ai_synthetic_talking.mp4` | **Fake (Synthetic Talking)**| $320 \times 240$ | 30 | Unnatural rapid eye-blink glitch (15 fps), mouth shape warping, periodic color channel desynchronization. |

---

## 🚀 How to Test

1. **In the Web App**:
   - Open the web application (`npm run dev`).
   - Navigate to the **Live Demo** section.
   - Drag and drop any file from `sample_data/audio/`, `sample_data/images/`, or `sample_data/video/` directly into the upload area.
   - Observe the real-time spectral breakdown, temporal consistency, confidence score, and Neon DB synchronization.

2. **Regenerate Samples**:
   To regenerate or modify any sample file, run:
   ```bash
   python scripts/generate_test_samples.py
   ```
