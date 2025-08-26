import torch
import clip
import numpy as np
import cv2
from PIL import Image

# Khởi tạo biến toàn cục
clip_model = None
clip_preprocess = None
clip_text = None

def load_clip_model(device="cuda" if torch.cuda.is_available() else "cpu"):
    global clip_model, clip_preprocess, clip_text
    if clip_model is not None:
        return  # Đã load rồi, không cần load lại

    print(f"🧠 Loading CLIP model on {device}...")
    clip_model, clip_preprocess = clip.load("ViT-B/32", device=device)
    clip_labels = ["a photo of a real human", "an anime character", "a cartoon face", "AI generated portrait"]
    clip_text = clip.tokenize(clip_labels).to(device)
    print("✅ CLIP model loaded.")

def is_anime_or_fake(image_bgr):
    global clip_model, clip_preprocess, clip_text

    if clip_model is None or clip_preprocess is None or clip_text is None:
        load_clip_model()

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(image_rgb)

    img_input = clip_preprocess(pil_img).unsqueeze(0).to(next(clip_model.parameters()).device)

    with torch.no_grad():
        image_features = clip_model.encode_image(img_input)
        text_features = clip_model.encode_text(clip_text)
        probs = (image_features @ text_features.T).softmax(dim=-1).cpu().numpy()[0]

    labels = ["real", "anime", "cartoon", "AI"]
    print("🎭 [CLIP] Xác suất phân loại ảnh:")
    for label, p in zip(labels, probs):
        print(f"  🔹 {label}: {p:.4f}")

    # Tìm nhãn có xác suất cao nhất
    max_index = np.argmax(probs)
    top_label = labels[max_index]
    top_prob = probs[max_index]

    print(f"🔍 Nhãn được chọn: {top_label} ({top_prob:.4f})")

    # Chỉ hợp lệ nếu nhãn cao nhất là 'real'
    return top_label != "real"

