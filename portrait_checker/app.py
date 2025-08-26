import sys
import os
import cv2
from ultralytics import YOLO


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Thêm vào sys.path đúng các thư mục chứa modules
sys.path.append(BASE_DIR)  # Để import utils/*
sys.path.append(os.path.join(BASE_DIR, "hopenet", "code"))  # hopenet/code/*
sys.path.append(os.path.join(BASE_DIR, "bisenet"))          # bisenet/*

# Import sau khi đã append path
from hopenet import Hopenet
from model import BiSeNet
from utils.check_background import is_background_ok, load_bisenet
from utils.check_pose import predict_pose_hopenet, load_hopenet
from utils.check_face import detect_face_retinaface, is_face_centered
from utils.detect_fake import is_anime_or_fake, load_clip_model


# Load models toàn cục (1 lần khi file được import)
hopenet = load_hopenet("Models/hopenet_hugeface.pkl")
bisenet = load_bisenet("Models/79999_iter.pth")
yolo = YOLO("Models/best_yolo_model.pt")
deepface = load_clip_model()

def check_portrait(image_path):
    image = cv2.imread(image_path)
    error_list = []

    if is_anime_or_fake(image):
        error_list.append("Vui lòng chọn ảnh người thật") 
        return error_list

    faces, bbox = detect_face_retinaface(image_path)
    if faces == 0:
        error_list.append("Không phát hiện khuôn mặt")
        return error_list
    elif faces > 1:
        error_list.append("Có quá nhiều người")

    if not is_face_centered(image, bbox):
        error_list.append("Mặt bị lệch khỏi trung tâm ảnh")

    results = yolo(image)[0]
    bad_classes = {"occludedface"}
    for b in results.boxes:
        cls_id = int(b.cls)
        conf   = float(b.conf)
        cls    = results.names[cls_id] 
        print(f"📐 [Object] {cls} (conf={conf:.2f})")
        if cls in bad_classes and conf >= 0.50:
            error_list.append("Khuôn mặt bị che khuất")
    error_list = list(dict.fromkeys(error_list))
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    if cv2.Laplacian(gray, cv2.CV_64F).var() < 80:
        error_list.append("Ảnh quá mờ")

    brightness = gray.mean()
    if brightness < 60:
        error_list.append("Ảnh quá tối")
    elif brightness > 220:
        error_list.append("Ảnh bị cháy sáng")

    yaw, pitch, roll = predict_pose_hopenet(image, hopenet)
    print(f"📐 [Pose] yaw={yaw:.2f}, pitch={pitch:.2f}, roll={roll:.2f}")
    if abs(yaw) > 40 or abs(pitch) > 30 or abs(roll) > 40:
        error_list.append("Góc mặt quá nghiêng")

    if not is_background_ok(image, bisenet):
        error_list.append("Vui lòng chọn ảnh có nền phù hợp")

    return error_list
