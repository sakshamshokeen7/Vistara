import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "autumn_photo.settings")

app = Celery("autumn_photo")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
