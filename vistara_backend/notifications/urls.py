from django.urls import path
from .views import NotificationListAPIView, MarkNotificationReadAPIView

urlpatterns = [
    path('', NotificationListAPIView.as_view()),
    path('<int:notification_id>/read/', MarkNotificationReadAPIView.as_view()),
]
