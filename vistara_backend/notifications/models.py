from django.db import models
from django.conf import settings

# Create your models here.
class Notification(models.Model):
    Notifications_TYPE = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('tag', 'Tag'),
        ('upload', 'Upload'),
    ]
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='notifications'
        )
    actor=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications'
    )
    notification_types=models.CharField(
        max_length=20,
        choices=Notifications_TYPE
    )
    message=models.TextField()
    is_read=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    photo_id=models.IntegerField(null=True, blank=True)
    event_id=models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.actor} -> {self.reciepient} : {self.notification_types}"
    