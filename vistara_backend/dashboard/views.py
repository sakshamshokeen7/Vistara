from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from photos.models import Photo, photo_like, photo_favourite, PhotoComment, PersonTag
from django.db.models import Count

class PhotographerDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
       
        total_uploads = Photo.objects.filter(uploader=user).count()
        total_likes = photo_like.objects.filter(photo__uploader=user).count()      
        total_comments = PhotoComment.objects.filter(photo__uploader=user).count()       
        total_favourites = photo_favourite.objects.filter(photo__uploader=user).count()       
        tags_count = PersonTag.objects.filter(photo__uploader=user).count()
       
        most_liked_photo = (
            Photo.objects.filter(uploader=user)
            .annotate(like_count=Count("likes"))
            .order_by("-like_count")
            .first()
        )

        most_liked = {
            "photo_id": most_liked_photo.id,
            "like_count": most_liked_photo.like_count,
            "thumbnail": (
            most_liked_photo.thumbnail_file.url
            if most_liked_photo.thumbnail_file
            else None
        ),
        } if most_liked_photo else None

        return Response({
            "total_uploads": total_uploads,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_favourites": total_favourites,
            "tags_count": tags_count,
            "most_liked_photo": most_liked,
        })

class PhotographerUploadsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user=request.user
        photos=(
            Photo.objects.filter(uploader=user)
            .annotate(
                likes_count=Count('likes'),
                comments_count=Count('comments'),
                favourites_count=Count('favourites'),
            )
        .order_by('-created_at')
        )

        data=[
            {
                'id': p.id,
                
                'thumbnail': (
                    (p.thumbnail_file.url if getattr(p, 'thumbnail_file') and getattr(p.thumbnail_file, 'url', None) else None)
                    or (p.display_file.url if getattr(p, 'display_file') and getattr(p.display_file, 'url', None) else None)
                    or (p.original_file.url if getattr(p, 'original_file') and getattr(p.original_file, 'url', None) else None)
                ),
                'display': p.display_file.url if getattr(p, 'display_file') and getattr(p.display_file, 'url', None) else None,
                'original': p.original_file.url if getattr(p, 'original_file') and getattr(p.original_file, 'url', None) else None,
                'likes_count':p.likes_count,
                'comments_count':p.comments_count,
                'favourites_count':p.favourites_count,
                'event':p.event.name,
                'created_at':p.created_at,
            } for p in photos            
        ]
        return Response({'uploads':data})
            
        
