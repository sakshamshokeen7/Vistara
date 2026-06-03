from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "actor",
            "actor_name",
            "notification_types",
            "message",
            "is_read",
            "created_at",
            "photo_id",
            "event_id",
        ]

    def get_actor_name(self, obj):
        user = obj.actor
        if hasattr(user, "full_name") and user.full_name:
            return user.full_name
        return user.email.split("@")[0]
