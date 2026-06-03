from django.urls import path
from .views import PhotographerDashboardAPIView, PhotographerUploadsAPIView

urlpatterns=[
    path('stats/',PhotographerDashboardAPIView.as_view(),name='photographer-dashboard'),
    path('uploads/',PhotographerUploadsAPIView.as_view(),name='photographer-uploads'),
]