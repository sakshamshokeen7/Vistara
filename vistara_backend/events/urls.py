from django.urls import path
from .views import EventListApiView,EventCreateApiView,EventDetailApiView, EventPhotoGalleryAPIView

urlpatterns = [
    path("", EventListApiView.as_view()),
    path("create/", EventCreateApiView.as_view()),
    path("<int:pk>/", EventDetailApiView.as_view()),
    path("<int:event_id>/photos/", EventPhotoGalleryAPIView.as_view(),name="event-photos"),
]