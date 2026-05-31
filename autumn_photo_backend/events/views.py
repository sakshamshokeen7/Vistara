from rest_framework import permissions,generics,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.db.models import Q
from photos.models import Photo
from photos.serializers import EventPhotoSerializer
from .models import Event
from django.db import models
from .serializers import EventSerializer
from .permissions import ISADMIN_OR_COORDINATOR
from datetime import datetime

# Create your views here.
class EventListApiView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug', 'description', 'location']

    def get_queryset(self):
        user = self.request.user
        
        # Base queryset based on permissions
        if user.is_authenticated and user.role == 'ADMIN':
            queryset = Event.objects.all()
        elif user.is_authenticated:
            queryset = Event.objects.filter(
                Q(is_public=True) |
                Q(coordinators=user)
            )
        else:
            queryset = Event.objects.filter(is_public=True)
        
        # Apply date range filters if provided
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from)
                queryset = queryset.filter(start_datetime__gte=date_from_obj)
            except (ValueError, TypeError):
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to)
                queryset = queryset.filter(end_datetime__lte=date_to_obj)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
class EventCreateApiView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[permissions.IsAuthenticated]

    def perform_create(self,serializer):
        if self.request.user.role!='ADMIN':
            raise PermissionError("Only ADMIN users can create events.")
        serializer.save(created_by=self.request.user)

class EventDetailApiView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[permissions.IsAuthenticated,ISADMIN_OR_COORDINATOR] 
    
class EventPhotoGalleryAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=404)

        sort = request.GET.get("sort", "latest")

        photos = Photo.objects.filter(event=event)

        photos = photos.annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
            favourites_count=Count("favourites", distinct=True),
        )

        if sort == "likes":
            photos = photos.order_by("-likes_count")
        elif sort == "views":
            photos = photos.order_by("-view_count")
        else:  
            photos = photos.order_by("-created_at")

        serializer = EventPhotoSerializer(photos, many=True, context={"request": request})
        return Response({
            "event": event.name,
            "total_photos": photos.count(),
            "photos": serializer.data
        })

    