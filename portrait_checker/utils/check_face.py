import cv2
from retinaface import RetinaFace

def detect_face_retinaface(image_path):
    faces = RetinaFace.detect_faces(image_path)
    if len(faces) == 0:
        return 0, None
    first_face = next(iter(faces.values()))
    return len(faces), first_face['facial_area']

def is_face_centered(image, bbox, tolerance_x=0.15, tolerance_y=0.20):
    h, w, _ = image.shape
    center_x = w / 2
    center_y = h / 2

    # bbox = (x_min, y_min, x_max, y_max)
    x_min, y_min, x_max, y_max = bbox
    face_x = (x_min + x_max) / 2
    face_y = (y_min + y_max) / 2

    max_dx = w * tolerance_x
    max_dy = h * tolerance_y

    is_centered = abs(face_x - center_x) <= max_dx and abs(face_y - center_y) <= max_dy

    # Debug thông tin để dễ kiểm tra
    print(f"[Check Center] Ảnh ({w}x{h}) → Tâm ({center_x:.1f}, {center_y:.1f})")
    print(f"[Check Center] Mặt ({face_x:.1f}, {face_y:.1f}) → Max dx={max_dx:.1f}, dy={max_dy:.1f}")
    print(f"[Check Center] ✅ Kết quả: {'Trung tâm' if is_centered else 'Lệch tâm'}")

    return is_centered
