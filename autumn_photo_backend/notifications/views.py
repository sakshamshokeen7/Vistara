from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListAPIView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')


class MarkNotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user
            )
            notification.is_read = True
            notification.save()
            return Response({"message": "Marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
