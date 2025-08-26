
import torch
from torchvision import transforms
import numpy as np
import cv2
from model import BiSeNet

def load_bisenet(path):
    net = BiSeNet(n_classes=19)
    net.load_state_dict(torch.load(path, map_location=torch.device("cpu")))
    net.eval()
    return net

def is_background_ok(image, net):
    device = next(net.parameters()).device
    to_tensor = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((512, 512)),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])

    with torch.no_grad():
        img_tensor = to_tensor(image).unsqueeze(0).to(device)
        out = net(img_tensor)[0]
        parsing = out.squeeze(0).argmax(0).cpu().numpy()

    unique, counts = np.unique(parsing, return_counts=True)
    class_counts = dict(zip(unique, counts))
    background_ratio = class_counts.get(0, 0) / parsing.size
    print(f"🌫️ Background ratio: {background_ratio:.2%}")

    image_resized = cv2.resize(image, (parsing.shape[1], parsing.shape[0]))
    background_area = image_resized[parsing == 0]
    if background_area.size > 0:
        std_dev = np.std(background_area)
        print(f"🎨 Background std deviation: {std_dev:.2f}")
        return background_ratio < 0.75 and std_dev <= 95
    return False
