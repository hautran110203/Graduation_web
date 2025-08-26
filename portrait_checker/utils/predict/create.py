import cv2
import numpy as np
import os

# Thư mục ảnh gốc và lưu kết quả
input_dir = "/content/drive/MyDrive/portrait_checker/original_images"
output_overexposed = "/content/drive/MyDrive/portrait_checker/aug_overexposed"
output_offcenter = "/content/drive/MyDrive/portrait_checker/aug_offcenter"

os.makedirs(output_overexposed, exist_ok=True)
os.makedirs(output_offcenter, exist_ok=True)

def create_overexposed(image):
    """Tăng sáng quá mức để tạo lỗi cháy sáng"""
    over = cv2.convertScaleAbs(image, alpha=1.5, beta=100)  # alpha: contrast, beta: brightness
    return np.clip(over, 0, 255)

def create_offcenter(image, shift_x=0, shift_y=0):
    """Dịch khuôn mặt ra khỏi trung tâm"""
    rows, cols = image.shape[:2]
    M = np.float32([[1, 0, shift_x], [0, 1, shift_y]])
    shifted = cv2.warpAffine(image, M, (cols, rows),
                              borderMode=cv2.BORDER_CONSTANT, borderValue=(255,255,255))
    return shifted

# Duyệt ảnh
for filename in os.listdir(input_dir):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        img_path = os.path.join(input_dir, filename)
        img = cv2.imread(img_path)

        if img is None:
            continue

        # 1️⃣ Tạo ảnh cháy sáng
        over_img = create_overexposed(img)
        cv2.imwrite(os.path.join(output_overexposed, filename), over_img)

        # 2️⃣ Tạo các ảnh off_center đa hướng
        shifts = [
            (80, 0),   # dịch sang phải
            (80, 0),  # dịch sang trái
            (0, 60),   # dịch xuống
            (0, -60),  # dịch lên
            (60, 40),  # lệch chéo xuống phải
            (-60, -40) # lệch chéo lên trái
        ]
        for i, (sx, sy) in enumerate(shifts):
            off_img = create_offcenter(img, shift_x=sx, shift_y=sy)
            new_name = f"{os.path.splitext(filename)[0]}_off{i}.jpg"
            cv2.imwrite(os.path.join(output_offcenter, new_name), off_img)

print("✅ Hoàn tất tạo ảnh lỗi: cháy sáng và off_center đa hướng.")
