import torch
from torchvision import transforms
import cv2
from PIL import Image
from hopenet import Hopenet
import torchvision.models as models

def load_hopenet(path):
    model = Hopenet(models.resnet.Bottleneck, [3, 4, 6, 3], 66)
    model.load_state_dict(torch.load(path, map_location=torch.device("cpu")))
    model.eval()
    return model

def predict_pose_hopenet(image, model):
    device = next(model.parameters()).device
    transformations = transforms.Compose([
        transforms.Resize(224),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(img)
    img_tensor = transformations(img).unsqueeze(0).to(device)

    with torch.no_grad():
        yaw, pitch, roll = model(img_tensor)
        idx_tensor = torch.arange(66, dtype=torch.float32).to(device) * 3 - 99
        yaw_pred = torch.sum(torch.softmax(yaw, dim=1) * idx_tensor).item()
        pitch_pred = torch.sum(torch.softmax(pitch, dim=1) * idx_tensor).item()
        roll_pred = torch.sum(torch.softmax(roll, dim=1) * idx_tensor).item()
    return yaw_pred, pitch_pred, roll_pred
