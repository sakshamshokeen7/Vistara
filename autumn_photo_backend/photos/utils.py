from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import ExifTags

def extract_exif(image):
    try:
        img = Image.open(image)
        exif_data = {}
        if hasattr(img, "_getexif"):
            raw_exif = img._getexif() or {}
            for tag, value in raw_exif.items():
                key = ExifTags.TAGS.get(tag, tag)
                exif_data[key] = str(value)
        return exif_data
    except:
        return {}
    
def generate_thumbnail(image):
    img = Image.open(image)
    img.thumbnail((400, 400))

    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue())

def generate_display(image):
    img = Image.open(image)
    img.thumbnail((1200, 1200))

    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue())

def generate_watermarked_display(image_file):
    img = Image.open(image_file).convert("RGBA")
    draw = ImageDraw.Draw(img)

    text = "Vistara"
    font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = img.width - text_width - 10
    y = img.height - text_height - 10

    draw.text((x, y), text, fill=(255, 255, 255, 128), font=font)

    out = BytesIO()
    img.save(out, format="PNG")
    out.seek(0)
    return ContentFile(out.read())
