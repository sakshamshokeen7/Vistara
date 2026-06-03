import torch
from PIL import Image
from .model import model, labels, transform

def classify_image(image_path):
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(tensor)
        probs = torch.nn.functional.softmax(output[0], dim=0)

    top5 = torch.topk(probs, 5)

    tags = {}
    for i in range(5):
        tag = labels[top5.indices[i]]
        confidence = float(top5.values[i])
        tags[tag] = round(confidence, 3)

    return tags
