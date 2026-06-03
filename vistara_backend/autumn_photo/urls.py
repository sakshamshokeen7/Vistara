"""
URL configuration for autumn_photo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path,include
import os
from autumn_photo.settings import BASE_DIR

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/events/',include('events.urls')),
    path("", lambda request: HttpResponse("Backend is running!")),
    path('api/photos/',include('photos.urls')),
    path('api/dashboard/',include('dashboard.urls')),
    path('api/adminpanel/',include('adminpanel.urls')),
    path('api/notifications/', include('notifications.urls')),
    path("api/accounts/", include("accounts.urls")),
]
if settings.DEBUG:
    # Serve media files during development using MEDIA_URL and MEDIA_ROOT
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
