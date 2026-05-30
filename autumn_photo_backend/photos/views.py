from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment
from events.models import Event
from notifications.tasks import send_notification as create_notification

from .serializers import (
    PhotoSerializer,
    PhotoDetailSerializer,
    PhotoCommentSerializer,
    AddCommentSerializer,
    EventPhotoSerializer,
    PersonTagSerializer,
    MultiplePhotoUploadSerializer,
)


class PhotoUploadAPIView(generics.CreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)


class EventPhotoListAPIView(APIView):
    def get(self, request, event_id):
        sort = request.GET.get("sort", "latest")

        photos = (
            Photo.objects.filter(event_id=event_id, is_deleted=False)
            .annotate(
                likes_count=Count("likes"),
                comments_count=Count("comments"),
                favourites_count=Count("favourites"),
            )
        )

        if sort == "likes":
            photos = photos.order_by("-likes_count")
        else:
            photos = photos.order_by("-created_at")

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )

        return Response({
            "event": event_id,
            "total_photos": photos.count(),
            "photos": serializer.data,
        })

class PhotoDetailAPIView(APIView):
    def get(self, request, photo_id):
        photo = (
            Photo.objects.filter(id=photo_id)
            .annotate(
                likes_count=Count("likes"),
                comments_count=Count("comments"),
                favourites_count=Count("favourites"),
            )
            .first()
        )

        if not photo:
            return Response({"error": "Photo not found"}, status=404)

        serializer = PhotoDetailSerializer(photo)
        return Response(serializer.data)

    def delete(self, request, photo_id):
        photo = get_object_or_404(Photo, id=photo_id)

        if photo.uploader != request.user and not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=403)

        photo.is_deleted = True
        photo.save()
        return Response({"message": "Photo deleted"})

class ToggleLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = get_object_or_404(Photo, id=photo_id)

        like, created = photo_like.objects.get_or_create(
            photo=photo,
            user=request.user,
        )

        if not created:
            like.delete()
            return Response({"liked": False})

 
        if photo.uploader_id != request.user.id:
            create_notification.delay({
                "recipient": photo.uploader_id,
                "actor": request.user.id,
                "notification_type": "like",
                "message": f"{request.user.email} liked your photo",
                "photo_id": photo.id,
            })

        return Response({"liked": True})

class ToggleFavouriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        photo = get_object_or_404(Photo, id=photo_id)

        fav, created = photo_favourite.objects.get_or_create(
            photo=photo,
            user=request.user,
        )

        if not created:
            fav.delete()
            return Response({"favourited": False})

        return Response({"favourited": True})


class TagPersonAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        tagged = request.data.get("tagged_user")

        from django.contrib.auth import get_user_model
        User = get_user_model()

        if not tagged:
            return Response({"error": "tagged_user required"}, status=400)

        if str(tagged).isdigit():
            user = User.objects.filter(id=tagged).first()
        else:
            user = User.objects.filter(email__iexact=tagged).first()

        if not user:
            return Response({"error": "User not found"}, status=404)

        serializer = PersonTagSerializer(data={"tagged_user": user.id})
        serializer.is_valid(raise_exception=True)

        tag = serializer.save(
            photo_id=photo_id,
            created_by=request.user,
        )

        if user.id != request.user.id:
            create_notification.delay({
                "recipient": user.id,
                "actor": request.user.id,
                "notification_type": "tag",
                "message": f"{request.user.email} tagged you in a photo",
                "photo_id": photo_id,
            })

        return Response({"message": "User tagged"})

class CommentCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, photo_id):
        serializer = AddCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        parent_comment_id = serializer.validated_data.get("parent_comment_id")
        parent_comment = None
        
        if parent_comment_id:
            parent_comment = get_object_or_404(PhotoComment, id=parent_comment_id, photo_id=photo_id)

        comment = PhotoComment.objects.create(
            user=request.user,
            photo_id=photo_id,
            text=serializer.validated_data["text"],
            parent_comment=parent_comment,
        )

        photo = comment.photo
        
        try:
            # Notify photo uploader if this is a top-level comment
            if parent_comment is None and photo.uploader_id != request.user.id:
                create_notification.delay({
                    "recipient": photo.uploader_id,
                    "actor": request.user.id,
                    "notification_type": "comment",
                    "message": f"{request.user.email} commented on your photo",
                    "photo_id": photo.id,
                })
            
            # Notify parent comment author if this is a reply (to a top-level comment or another reply)
            if parent_comment and parent_comment.user:
                if parent_comment.user_id != request.user.id:
                    create_notification.delay({
                        "recipient": parent_comment.user_id,
                        "actor": request.user.id,
                        "notification_type": "reply",
                        "message": f"{request.user.email} replied to your comment",
                        "photo_id": photo.id,
                    })
        except Exception as e:
            # Log the notification error but don't fail the comment creation
            print(f"Error sending notification: {str(e)}")

        comment_serializer = PhotoCommentSerializer(comment)
        return Response({"message": "Comment added", "comment": comment_serializer.data}, status=201)

class CommentListAPIView(generics.ListAPIView):
    serializer_class = PhotoCommentSerializer

    def get_queryset(self):
        return PhotoComment.objects.filter(
            photo_id=self.kwargs["photo_id"],
            parent_comment__isnull=True
        ).order_by("-created_at")

class MultiplePhotoUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MultiplePhotoUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event = get_object_or_404(Event, id=serializer.validated_data["event_id"])
        files = serializer.validated_data["files"]

        from .tasks import process_photo

        uploaded = []
        for file in files:
            photo = Photo.objects.create(
                event=event,
                uploader=request.user,
                processing_status="pending",
            )
            photo.original_file.save(file.name, file)
            process_photo.delay(photo.id)

            uploaded.append({
                "photo_id": photo.id,
                "status": photo.processing_status,
            })

        return Response({
            "uploaded_count": len(uploaded),
            "photos": uploaded,
        })


class MyLikedPhotosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            is_deleted=False,
            likes__user=request.user,
        ).distinct()

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )
        return Response({"photos": serializer.data})

class MyFavouritedPhotosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            is_deleted=False,
            favourites__user=request.user,
        ).distinct()

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )
        return Response({"photos": serializer.data})

class MyTaggedPhotosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            is_deleted=False,
            person_tags__tagged_user=request.user,
        ).distinct()

        serializer = EventPhotoSerializer(
            photos, many=True, context={"request": request}
        )
        return Response({"photos": serializer.data})


class PhotoSearchAPIView(APIView):
    permission_classes = []

    def get(self, request):
        query = request.GET.get("q", "").strip().lower()
        if not query or len(query) < 2:
            return Response({"photos": []})

        # First get photos by person tags or event
        photos_qs = (
            Photo.objects.filter(is_deleted=False)
            .filter(
                Q(person_tags__tagged_user__email__icontains=query)
                | Q(person_tags__tagged_user__full_name__icontains=query)
                | Q(event__name__icontains=query)
                | Q(event__description__icontains=query)
            )
            .annotate(
                likes_count=Count("likes", distinct=True),
                comments_count=Count("comments", distinct=True),
                favourites_count=Count("favourites", distinct=True),
            )
            .distinct()
        )

        photo_ids = set(photos_qs.values_list('id', flat=True))

        # Also search in AI tags (JSONField)
        all_photos = Photo.objects.filter(is_deleted=False).exclude(id__in=photo_ids)
        for photo in all_photos:
            # Check if query matches in the tags JSON
            if photo.tags:
                # Convert entire tags dict/list to lowercase string and search
                tags_str = str(photo.tags).lower()
                # Remove quotes, brackets, and curly braces for better matching
                tags_str = tags_str.replace("'", "").replace('"', '').replace('{', '').replace('}', '').replace('[', '').replace(']', '')
                
                # Check if query appears in the cleaned tags string
                if query in tags_str:
                    photo_ids.add(photo.id)

        # Get final queryset with all matching photos
        final_photos = (
            Photo.objects.filter(id__in=photo_ids, is_deleted=False)
            .annotate(
                likes_count=Count("likes", distinct=True),
                comments_count=Count("comments", distinct=True),
                favourites_count=Count("favourites", distinct=True),
            )
            .order_by("-created_at")
        )

        serializer = EventPhotoSerializer(final_photos, many=True, context={"request": request})
        return Response({"photos": serializer.data})
