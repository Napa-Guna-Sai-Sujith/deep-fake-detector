import os
import math
import struct
import wave
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

def ensure_dirs():
    dirs = [
        "sample_data/audio",
        "sample_data/images",
        "sample_data/video",
        "public/sample_data/audio",
        "public/sample_data/images",
        "public/sample_data/video",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# 1. AUDIO GENERATION
# -------------------------------------------------------------
def generate_wav(filepath, duration_sec, sample_rate, generate_sample_fn):
    num_samples = int(duration_sec * sample_rate)
    with wave.open(filepath, "w") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(num_samples):
            t = i / sample_rate
            sample = generate_sample_fn(t, i, num_samples, sample_rate)
            # Clamp to -1.0 to 1.0
            sample = max(-1.0, min(1.0, sample))
            int_sample = int(sample * 32767.0)
            frames.extend(struct.pack("<h", int_sample))
        
        wav_file.writeframes(frames)
    print(f"Generated audio: {filepath}")

def generate_all_audio():
    sample_rate = 44100
    
    # Genuine 1: Natural Human Speech simulation (formants, micro-vibrato, natural pause)
    def genuine_voice_1(t, i, total, sr):
        # Speech cadence envelope
        envelope = (math.sin(2 * math.pi * 1.2 * t) ** 2) * (0.8 + 0.2 * math.sin(2 * math.pi * 0.3 * t))
        # Pitch contour: gentle variation around 140Hz
        f0 = 140 + 15 * math.sin(2 * math.pi * 2.5 * t) + 3 * math.sin(2 * math.pi * 7.0 * t)
        
        # Formants (Vowel /a/ & /o/ mix: F1 ~ 600Hz, F2 ~ 1200Hz, F3 ~ 2400Hz)
        sig = 0.5 * math.sin(2 * math.pi * f0 * t)
        sig += 0.3 * math.sin(2 * math.pi * 2 * f0 * t)
        sig += 0.2 * math.sin(2 * math.pi * 3 * f0 * t)
        sig += 0.15 * math.sin(2 * math.pi * 4 * f0 * t)
        sig += 0.1 * math.sin(2 * math.pi * 5 * f0 * t)
        
        # Resonance amplification
        f1_res = 0.25 * math.sin(2 * math.pi * 650 * t) * (math.sin(2 * math.pi * f0 * t) > 0)
        f2_res = 0.15 * math.sin(2 * math.pi * 1250 * t) * (math.sin(2 * math.pi * f0 * t) > 0)
        
        # Natural subtle room acoustics & breath
        breath = 0.03 * (np.random.random() * 2 - 1)
        return (sig + f1_res + f2_res + breath) * envelope * 0.7

    # Genuine 2: Clean Acoustic Speech
    def genuine_voice_2(t, i, total, sr):
        envelope = math.exp(-((t % 1.5 - 0.75) ** 2) / 0.15)
        f0 = 195 + 20 * math.cos(2 * math.pi * 3.0 * t)  # female pitch range
        sig = 0.6 * math.sin(2 * math.pi * f0 * t) + 0.25 * math.sin(2 * math.pi * 2 * f0 * t) + 0.15 * math.sin(2 * math.pi * 3 * f0 * t)
        formant = 0.2 * math.sin(2 * math.pi * 1800 * t)
        noise = 0.02 * (np.random.random() * 2 - 1)
        return (sig + formant + noise) * envelope * 0.75

    # Fake 1: TTS / Robotic Synthesized Voice (quantized pitch, metallic vocoder buzz, flat spectral flux)
    def fake_tts_1(t, i, total, sr):
        # Unnaturally rigid pitch grid (hard-quantized steps)
        step = int(t * 4) % 3
        f0 = [135.0, 135.0, 135.0][step]  # Rigid flat fundamental
        
        # Sawtooth / harsh harmonic series typical of low-order neural vocoders
        sig = 0.0
        for h in range(1, 15):
            sig += (1.0 / h) * math.sin(2 * math.pi * (f0 * h) * t)
        
        # High frequency metallic carrier buzz artifact (4kHz & 8kHz)
        metallic_buzz = 0.12 * math.sin(2 * math.pi * 4200 * t) + 0.08 * math.sin(2 * math.pi * 8400 * t)
        # Phase glitch pulses
        glitch = 0.2 if (i % 2200 < 5) else 0.0
        
        return (sig * 0.35 + metallic_buzz + glitch) * 0.75

    # Fake 2: Voice Clone Deepfake (high-frequency cutoff, phase discontinuity, synthetic shimmer)
    def fake_voice_clone_2(t, i, total, sr):
        f0 = 150.0  # static pitch
        phase_jitter = 0.5 * math.sin(2 * math.pi * 60 * t)  # 60Hz hum jitter
        sig = math.sin(2 * math.pi * f0 * t + phase_jitter)
        # High spectral flatness artifact (white noise layer + harsh harmonic peaks)
        harsh_harmonics = 0.3 * math.sin(2 * math.pi * 3 * f0 * t) + 0.25 * math.sin(2 * math.pi * 7 * f0 * t)
        noise_envelope = 0.15 * (np.random.random() * 2 - 1)
        # Periodic neural artifact chirp
        chirp = 0.1 * math.sin(2 * math.pi * (1000 + 3000 * (t % 0.5)) * t)
        return (sig * 0.4 + harsh_harmonics + noise_envelope + chirp) * 0.7

    files = [
        ("sample_data/audio/genuine_human_voice.wav", 3.0, genuine_voice_1),
        ("sample_data/audio/genuine_acoustic_speech.wav", 3.0, genuine_voice_2),
        ("sample_data/audio/fake_tts_synthesized.wav", 3.0, fake_tts_1),
        ("sample_data/audio/fake_voice_clone.wav", 3.0, fake_voice_clone_2),
    ]

    for path, dur, fn in files:
        generate_wav(path, dur, sample_rate, fn)
        # Also copy to public
        pub_path = path.replace("sample_data/", "public/sample_data/")
        generate_wav(pub_path, dur, sample_rate, fn)

# -------------------------------------------------------------
# 2. IMAGE GENERATION
# -------------------------------------------------------------
def create_base_portrait(width=512, height=512, is_fake=False, artifact_type="none"):
    img = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Background: Smooth studio gradient
    for y in range(height):
        ratio = y / height
        color = [int(30 + 40 * ratio), int(35 + 30 * ratio), int(45 + 50 * ratio)]
        img[y, :] = color

    center_x, center_y = width // 2, int(height * 0.48)
    
    # Face silhouette base (warm natural skin tone)
    face_axes = (110, 150)
    cv2.ellipse(img, (center_x, center_y), face_axes, 0, 0, 360, (180, 205, 235), -1)
    
    # Hair
    cv2.ellipse(img, (center_x, center_y - 60), (125, 120), 0, 180, 360, (30, 25, 25), -1)
    cv2.ellipse(img, (center_x - 110, center_y + 10), (30, 90), 0, 0, 360, (30, 25, 25), -1)
    cv2.ellipse(img, (center_x + 110, center_y + 10), (30, 90), 0, 0, 360, (30, 25, 25), -1)

    # Eyes
    left_eye = (center_x - 45, center_y - 15)
    right_eye = (center_x + 45, center_y - 15)
    
    for eye_center in [left_eye, right_eye]:
        cv2.ellipse(img, eye_center, (20, 10), 0, 0, 360, (250, 250, 250), -1)
        cv2.circle(img, eye_center, 8, (60, 45, 30), -1)  # Iris
        cv2.circle(img, eye_center, 4, (10, 10, 10), -1)  # Pupil
        cv2.circle(img, (eye_center[0] - 2, eye_center[1] - 2), 2, (255, 255, 255), -1) # Specular reflection

    # Eyebrows
    cv2.ellipse(img, (center_x - 45, center_y - 35), (25, 4), -10, 0, 360, (35, 30, 25), -1)
    cv2.ellipse(img, (center_x + 45, center_y - 35), (25, 4), 10, 0, 360, (35, 30, 25), -1)

    # Nose
    cv2.line(img, (center_x, center_y - 10), (center_x, center_y + 30), (150, 175, 205), 2)
    cv2.ellipse(img, (center_x, center_y + 32), (14, 6), 0, 0, 180, (140, 165, 195), -1)

    # Mouth / Lips
    cv2.ellipse(img, (center_x, center_y + 75), (28, 10), 0, 0, 360, (110, 120, 210), -1)
    cv2.ellipse(img, (center_x, center_y + 73), (26, 4), 0, 0, 360, (80, 90, 170), -1)

    # Shoulders / Clothes
    cv2.ellipse(img, (center_x, height + 40), (220, 120), 0, 180, 360, (40, 70, 90), -1)

    # Soft natural gaussian blur for smooth photorealistic blend
    img = cv2.GaussianBlur(img, (5, 5), 1.2)

    if not is_fake:
        # Genuine photorealistic post-processing: natural film grain & subtle noise pattern
        noise = np.random.normal(0, 3.0, img.shape).astype(np.float32)
        img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    else:
        # Deepfake artifacts simulation
        if artifact_type == "gan_artifacts":
            # 1. High frequency GAN checkerboard grid artifact
            for y in range(0, height, 4):
                for x in range(0, width, 4):
                    if (x // 4 + y // 4) % 2 == 0:
                        img[y:y+2, x:x+2] = np.clip(img[y:y+2, x:x+2].astype(np.int16) + 18, 0, 255).astype(np.uint8)
            # 2. Inconsistent pupil reflection & blurred hair/skin boundary
            cv2.circle(img, (right_eye[0] + 5, right_eye[1] - 3), 4, (240, 50, 50), -1) # Aberration
            # 3. Warped mouth edge
            cv2.ellipse(img, (center_x + 25, center_y + 75), (12, 12), 45, 0, 360, (150, 160, 220), -1)
            img = cv2.GaussianBlur(img, (3, 3), 0.8)
        
        elif artifact_type == "faceswap_boundary":
            # Face-swap boundary seam: unnatural color step around face perimeter
            pts = cv2.ellipse2Poly((center_x, center_y), face_axes, 0, 0, 360, 10)
            cv2.polylines(img, [pts], True, (130, 220, 255), 2, cv2.LINE_AA)
            # Mismatched color grading inside face vs neck
            neck_rect = img[center_y+90:center_y+150, center_x-50:center_x+50]
            img[center_y+90:center_y+150, center_x-50:center_x+50] = cv2.addWeighted(neck_rect, 0.7, np.full_like(neck_rect, (50, 80, 160)), 0.3, 0)
            # Edge pixelation
            cv2.rectangle(img, (center_x - 60, center_y - 30), (center_x + 60, center_y + 90), (0, 255, 255), 1)

    return img

def generate_all_images():
    # 1. Genuine portrait
    img_real1 = create_base_portrait(512, 512, is_fake=False)
    cv2.imwrite("sample_data/images/genuine_portrait_photo.jpg", img_real1, [cv2.IMWRITE_JPEG_QUALITY, 95])
    cv2.imwrite("public/sample_data/images/genuine_portrait_photo.jpg", img_real1, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print("Generated image: sample_data/images/genuine_portrait_photo.jpg")

    # 2. Genuine natural face (PNG)
    img_real2 = create_base_portrait(512, 512, is_fake=False)
    cv2.imwrite("sample_data/images/genuine_natural_face.png", img_real2)
    cv2.imwrite("public/sample_data/images/genuine_natural_face.png", img_real2)
    print("Generated image: sample_data/images/genuine_natural_face.png")

    # 3. Fake AI Generated Face (GAN Grid Artifacts & pupil mismatch)
    img_fake1 = create_base_portrait(512, 512, is_fake=True, artifact_type="gan_artifacts")
    cv2.imwrite("sample_data/images/fake_ai_generated_face.jpg", img_fake1, [cv2.IMWRITE_JPEG_QUALITY, 90])
    cv2.imwrite("public/sample_data/images/fake_ai_generated_face.jpg", img_fake1, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("Generated image: sample_data/images/fake_ai_generated_face.jpg")

    # 4. Fake Face Swap Edit (Boundary Seams & Tone Mismatch)
    img_fake2 = create_base_portrait(512, 512, is_fake=True, artifact_type="faceswap_boundary")
    cv2.imwrite("sample_data/images/fake_face_swap_edit.png", img_fake2)
    cv2.imwrite("public/sample_data/images/fake_face_swap_edit.png", img_fake2)
    print("Generated image: sample_data/images/fake_face_swap_edit.png")

# -------------------------------------------------------------
# 3. VIDEO GENERATION
# -------------------------------------------------------------
def generate_video(filepath, num_frames=60, fps=30, is_fake=False, video_type="interview"):
    width, height = 320, 240
    # Use MP4V codec which is widely supported across OpenCV
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(filepath, fourcc, fps, (width, height))
    
    center_x = width // 2
    center_y = int(height * 0.48)

    for f in range(num_frames):
        t = f / fps
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Background
        for y in range(height):
            ratio = y / height
            frame[y, :] = [int(25 + 20 * ratio), int(30 + 20 * ratio), int(40 + 30 * ratio)]
            
        # Natural head bobbing / movement
        head_x_offset = int(6 * math.sin(2 * math.pi * 0.5 * t))
        head_y_offset = int(3 * math.cos(2 * math.pi * 1.0 * t))
        cx = center_x + head_x_offset
        cy = center_y + head_y_offset

        # Head & face
        face_axes = (60, 80)
        cv2.ellipse(frame, (cx, cy), face_axes, 0, 0, 360, (180, 205, 235), -1)
        # Hair
        cv2.ellipse(frame, (cx, cy - 35), (68, 60), 0, 180, 360, (30, 25, 25), -1)

        # Eyes & Natural blink logic (blink at frame 25-30)
        is_blinking = (24 <= f <= 28) if not is_fake else (f % 15 == 0) # In fake: abnormal rapid glitch blink
        eye_y = cy - 10
        for eye_x in [cx - 24, cx + 24]:
            if is_blinking:
                cv2.line(frame, (eye_x - 10, eye_y), (eye_x + 10, eye_y), (40, 30, 20), 2)
            else:
                cv2.ellipse(frame, (eye_x, eye_y), (10, 6), 0, 0, 360, (250, 250, 250), -1)
                cv2.circle(frame, (eye_x, eye_y), 4, (60, 45, 30), -1)
                cv2.circle(frame, (eye_x - 1, eye_y - 1), 1, (255, 255, 255), -1)

        # Talking mouth animation
        mouth_opening = int(4 + 5 * (math.sin(2 * math.pi * 4 * t) ** 2))
        cv2.ellipse(frame, (cx, cy + 40), (14, mouth_opening), 0, 0, 360, (90, 100, 180), -1)

        # Clothes
        cv2.ellipse(frame, (cx, height + 20), (120, 60), 0, 180, 360, (40, 70, 90), -1)

        if is_fake:
            # Deepfake temporal inconsistencies:
            # 1. Face boundary jitter (bounding box offset flickers)
            jitter_x = int(4 * (np.random.random() * 2 - 1))
            jitter_y = int(4 * (np.random.random() * 2 - 1))
            # 2. Boundary seam flickering around face
            if f % 3 == 0:
                cv2.ellipse(frame, (cx + jitter_x, cy + jitter_y), (face_axes[0]+2, face_axes[1]+2), 0, 0, 360, (0, 255, 255), 1)
            # 3. Mouth warping artifact
            if f % 4 == 0:
                cv2.rectangle(frame, (cx - 20, cy + 30), (cx + 20, cy + 50), (200, 180, 100), 1)
            # 4. Color flickering / desync
            if f % 8 == 0:
                frame = cv2.bitwise_not(frame, mask=None) * 0.1 + frame * 0.9
                frame = np.clip(frame, 0, 255).astype(np.uint8)
        else:
            # Natural subtle camera noise
            noise = np.random.normal(0, 1.5, frame.shape).astype(np.float32)
            frame = np.clip(frame.astype(np.float32) + noise, 0, 255).astype(np.uint8)

        out.write(frame)

    out.release()
    print(f"Generated video: {filepath}")

def generate_all_videos():
    # 1. Genuine interview clip
    generate_video("sample_data/video/genuine_interview_clip.mp4", 60, 30, is_fake=False, video_type="interview")
    generate_video("public/sample_data/video/genuine_interview_clip.mp4", 60, 30, is_fake=False, video_type="interview")

    # 2. Genuine video stream
    generate_video("sample_data/video/genuine_video_stream.mp4", 60, 30, is_fake=False, video_type="stream")
    generate_video("public/sample_data/video/genuine_video_stream.mp4", 60, 30, is_fake=False, video_type="stream")

    # 3. Fake deepfake face swap video
    generate_video("sample_data/video/fake_deepfake_face_swap.mp4", 60, 30, is_fake=True, video_type="faceswap")
    generate_video("public/sample_data/video/fake_deepfake_face_swap.mp4", 60, 30, is_fake=True, video_type="faceswap")

    # 4. Fake AI synthetic talking avatar
    generate_video("sample_data/video/fake_ai_synthetic_talking.mp4", 60, 30, is_fake=True, video_type="avatar")
    generate_video("public/sample_data/video/fake_ai_synthetic_talking.mp4", 60, 30, is_fake=True, video_type="avatar")

# -------------------------------------------------------------
# MAIN
# -------------------------------------------------------------
if __name__ == "__main__":
    ensure_dirs()
    print("--- 1. Generating Audio Samples ---")
    generate_all_audio()
    print("--- 2. Generating Image Samples ---")
    generate_all_images()
    print("--- 3. Generating Video Samples ---")
    generate_all_videos()
    print("All sample files generated successfully!")
