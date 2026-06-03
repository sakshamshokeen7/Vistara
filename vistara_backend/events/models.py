from django.db import models
from django.conf import settings

# Create your models here.
class Event(models.Model):
    name=models.CharField(max_length=255)
    slug=models.SlugField(unique=True,blank=True,null=True)
    description=models.TextField(blank=True,null=True)
    start_datetime=models.DateTimeField()
    end_datetime=models.DateTimeField()
    location=models.CharField(max_length=255,blank=True,null=True)
    qr_code_url=models.URLField(blank=True,null=True)
    is_public=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)

    cover_photo=models.ForeignKey(
     'photos.Photo',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='cover_for_events',
    )

    created_by=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='events_created'
    )
    
    coordinators=models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='coordinated_events',
        blank=True
    )

    def __str__(self):
        return self.name
