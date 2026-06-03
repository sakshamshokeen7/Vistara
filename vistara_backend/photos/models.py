from django.db import models
from django.conf import settings
# Create your models here.
class Photo(models.Model):
    event=models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='photos'
    )
    uploader=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_photos'
    )
    original_file=models.ImageField(upload_to='photos/originals/')
    display_file=models.ImageField(upload_to='photos/displays/')
    thumbnail_file=models.ImageField(upload_to='photos/thumbnails/')

    visibility=models.CharField(
        max_length=20,
        default='public',
        choices=[('public','PUBLIC'),('private','PRIVATE')]
    )
    shot_at=models.DateTimeField(null=True,blank=True)
    exif_metadata=models.JSONField(default=dict,blank=True)
    view_count=models.PositiveIntegerField(default=0)
    download_count=models.PositiveIntegerField(default=0)
    is_deleted=models.BooleanField(default=False)
    processing_status = models.CharField(
        max_length=20,
        choices=[('pending','Pending'),('processing','Processing'),('done','Done'),('failed','Failed')],
        default='pending'
    )
    created_at=models.DateTimeField(auto_now_add=True)
    tags=models.JSONField(default=dict,blank=True)

    def __str__(self):
        return f"Photo {self.id} - Event {self.event.name}"

class photo_like(models.Model):
    photo=models.ForeignKey(
        Photo,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='liked_photos'
    )
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('photo', 'user')

class photo_favourite(models.Model):
    photo=models.ForeignKey(
        Photo,
        on_delete=models.CASCADE,
        related_name='favourites'
    )
    user=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favourited_photos'
    )
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('photo', 'user')    

class PersonTag(models.Model):
    photo=models.ForeignKey(
        Photo,
        on_delete=models.CASCADE,
        related_name='person_tags'
    )
    tagged_user=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags_on_photos'
    )      
    created_by=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_person_tags'
    )
    created_at=models.DateTimeField(auto_now_add=True)
    face_box=models.JSONField(default=dict,blank=True)
    class Meta:
        unique_together = ('photo', 'tagged_user')

class PhotoComment(models.Model):
    photo=models.ForeignKey(
        Photo,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='photo_comments'
    )
    text=models.TextField()
    parent_comment=models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)    

