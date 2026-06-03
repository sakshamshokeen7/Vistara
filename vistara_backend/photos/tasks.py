from celery import shared_task
from django.core.files.base import ContentFile
from .models import Photo
from .utils import generate_thumbnail, generate_display, generate_watermarked_display, extract_exif
from .ml.classifier import classify_image
import os

@shared_task
def process_photo(photo_id):
    try:
        photo = Photo.objects.get(id=photo_id)
    except Photo.DoesNotExist:
        return {"status": "missing"}

    photo.processing_status = "processing"
    photo.save()

    try:
        orig = photo.original_file

        thumb = generate_thumbnail(orig)
        display = generate_display(orig)
        watermarked = generate_watermarked_display(orig)

        base_name = os.path.basename(orig.name)
        photo.thumbnail_file.save(f"thumb_{base_name}", thumb, save=False)
        photo.display_file.save(f"display_{base_name}", display, save=False)

        exif = extract_exif(orig)
        photo.exif_metadata = exif or {}

        image_path = orig.path  
        ai_tags = classify_image(image_path)

        photo.tags = ai_tags  

        photo.processing_status = "done"
        photo.save()

        return {
            "status": "done",
            "photo_id": photo_id,
            "tags": ai_tags
        }

    except Exception as e:
        photo.processing_status = "failed"
        photo.save()
        return {"status": "error", "error": str(e)}

    


