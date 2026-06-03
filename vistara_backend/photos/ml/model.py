import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import os

model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model.eval()

LABEL_PATH = os.path.join(os.path.dirname(__file__), "imagenet_classes.txt")

with open(LABEL_PATH) as f:
    labels = [line.strip() for line in f.readlines()]

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std =[0.229, 0.224, 0.225]
    )
])
