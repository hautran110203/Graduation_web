# badbg.py - Generate bad_background images locally on Windows
import os
import sys
import cv2
import random
import argparse
import numpy as np
from pathlib import Path
from glob import glob

# ========= Resolve paths & imports =========
# This file is at: .../portrait_checker_ec2/utils/predict/badbg.py
# We need to import from "utils", which lives in: .../portrait_checker_ec2/utils
# So add .../portrait_checker_ec2 to sys.path
THIS_FILE = Path(__file__).resolve()
PKG_ROOT = THIS_FILE.parents[2]  # .../portrait_checker_ec2
sys.path.insert(0, str(PKG_ROOT))

# Now we can import your RetinaFace wrapper
from utils.check_face import detect_face_retinaface  # faces, bbox = detect_face_retinaface(image_path)

# ========= Defaults (relative to project root) =========
DEFAULT_SRC = PKG_ROOT / "train_v2" / "faceok"      # ảnh gốc (face_ok)
DEFAULT_BG  = PKG_ROOT / "train_v2" / "images"      # ảnh nền "xấu"
DEFAULT_OUT = PKG_ROOT / "train_v2" / "bad_bg"      # nơi lưu ảnh kết quả

# GrabCut & compose params
RECT_PAD_RATIO = 0.45       # mở rộng bbox để lấy cả đầu/tóc/vai
GRABCUT_ITERS  = 5
BLUR_EDGE      = 9          # làm mềm rìa mask
BG_BRIGHT_JIT  = (-25, 25)  # jitter sáng nền
ALPHA_BLEND    = (0.0, 0.15)  # pha trộn foreground:nền (0 = sắc nét)

def load_random_bg(w: int, h: int, bg_dir: Path) -> np.ndarray:
    patterns = ("*.jpg","*.jpeg","*.png","*.webp","*.bmp")
    cand = []
    for ptn in patterns:
        cand.extend(bg_dir.glob(ptn))
    if not cand:
        return np.full((h, w, 3), 180, np.uint8)
    bg = cv2.imread(str(random.choice(cand)))
    if bg is None:
        return np.full((h, w, 3), 180, np.uint8)
    return cv2.resize(bg, (w, h), interpolation=cv2.INTER_AREA)

def jitter_brightness(img: np.ndarray, delta_range=(-25, 25)) -> np.ndarray:
    delta = random.randint(delta_range[0], delta_range[1])
    return cv2.convertScaleAbs(img, alpha=1.0, beta=delta)

def grabcut_with_rect(img: np.ndarray, rect):
    """
    rect: (x, y, w, h) in image coords
    """
    mask = np.zeros(img.shape[:2], np.uint8)
    bgdModel = np.zeros((1,65), np.float64)
    fgdModel = np.zeros((1,65), np.float64)
    cv2.grabCut(img, mask, rect, bgdModel, fgdModel, GRABCUT_ITERS, cv2.GC_INIT_WITH_RECT)
    # 0,2 -> background; 1,3 -> foreground
    mask_bin = np.where((mask==1) + (mask==3), 1, 0).astype('float32')
    if BLUR_EDGE > 0:
        k = BLUR_EDGE if BLUR_EDGE % 2 == 1 else BLUR_EDGE + 1
        mask_bin = cv2.GaussianBlur(mask_bin, (k, k), 0)
        mask_bin = np.clip(mask_bin, 0, 1)
    return mask_bin

def compose_foreground_on_bg(img: np.ndarray, mask: np.ndarray, bg: np.ndarray, alpha_extra: float=0.0) -> np.ndarray:
    mask3 = np.repeat(mask[..., None], 3, axis=2).astype(np.float32)
    fg = img.astype(np.float32)
    bgf = bg.astype(np.float32)
    if alpha_extra > 0:
        fg = (1 - alpha_extra) * fg + alpha_extra * bgf
    comp = (fg * mask3 + bgf * (1 - mask3)).astype(np.uint8)
    return comp

def expand_rect(x1, y1, x2, y2, W, H, pad_ratio=0.45):
    w = x2 - x1
    h = y2 - y1
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    nw = int(w * (1 + pad_ratio))
    nh = int(h * (1 + pad_ratio * 1.2))
    x = max(0, cx - nw // 2)
    y = max(0, cy - nh // 2)
    nw = min(nw, W - x)
    nh = min(nh, H - y)
    return (x, y, nw, nh)

from typing import Optional

def process_one_image(path: Path, bg_dir: Path) -> Optional[np.ndarray]:
    img = cv2.imread(str(path))
    if img is None:
        return None
    H, W = img.shape[:2]

    faces, bbox = detect_face_retinaface(str(path))
    if faces == 0 or bbox is None:
        return None

    x1, y1, x2, y2 = bbox
    x1 = max(0, min(W-1, int(x1))); x2 = max(0, min(W, int(x2)))
    y1 = max(0, min(H-1, int(y1))); y2 = max(0, min(H, int(y2)))
    if x2 <= x1 or y2 <= y1:
        return None

    rect = expand_rect(x1, y1, x2, y2, W, H, pad_ratio=RECT_PAD_RATIO)
    mask = grabcut_with_rect(img, rect)

    bg = load_random_bg(W, H, bg_dir)
    bg = jitter_brightness(bg, BG_BRIGHT_JIT)

    alpha_extra = random.uniform(*ALPHA_BLEND)
    out = compose_foreground_on_bg(img, mask, bg, alpha_extra=alpha_extra)
    return out

def main():
    parser = argparse.ArgumentParser(description="Generate bad_background images locally")
    parser.add_argument("--src", type=str, default=str(DEFAULT_SRC), help="Source folder of face_ok images")
    parser.add_argument("--bg",  type=str, default=str(DEFAULT_BG),  help="Background images folder (bad backgrounds)")
    parser.add_argument("--out", type=str, default=str(DEFAULT_OUT), help="Output folder for generated images")
    args = parser.parse_args()

    src_dir = Path(args.src)
    bg_dir  = Path(args.bg)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    patterns = ("*.jpg","*.jpeg","*.png","*.webp","*.bmp")
    src_paths = []
    for ptn in patterns:
        src_paths.extend(src_dir.glob(ptn))

    print(f"Found {len(src_paths)} source images in: {src_dir}")
    saved = 0
    for p in src_paths:
        out = process_one_image(p, bg_dir)
        if out is None:
            continue
        out_path = out_dir / f"{p.stem}_badbg.jpg"
        cv2.imwrite(str(out_path), out, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        saved += 1
    print(f"✅ Generated {saved} bad_background images -> {out_dir}")

if __name__ == "__main__":
    main()
