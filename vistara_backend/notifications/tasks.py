from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification


@shared_task
def send_notification(data):
    notif = Notification.objects.create(
        recipient_id=data["recipient"],
        actor_id=data["actor"],
        notification_types=data["notification_type"],
        message=data["message"],
        photo_id=data.get("photo_id"),
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{notif.recipient_id}",
        {
            "type": "send_notification",
            "data": {
                "id": notif.id,
                "message": notif.message,
                "notification_type": notif.notification_types,
                "photo_id": notif.photo_id,
                "created_at": notif.created_at.isoformat(),
                "actor_name": (
                    notif.actor.full_name
                    if getattr(notif.actor, "full_name", None)
                    else notif.actor.email.split("@")[0]
                ),
            },
        },
    )
