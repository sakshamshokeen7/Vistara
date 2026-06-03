from django.urls import path
from .views import (
    MultiplePhotoUploadAPIView,
    PhotoUploadAPIView,
    EventPhotoListAPIView,
    PhotoDetailAPIView,
    ToggleLikeAPIView,
    ToggleFavouriteAPIView,
    TagPersonAPIView,
    CommentCreateAPIView,
    CommentListAPIView,
    MyLikedPhotosAPIView,
    MyFavouritedPhotosAPIView,
    MyTaggedPhotosAPIView,
    PhotoSearchAPIView,
)

urlpatterns = [
    path("upload/", PhotoUploadAPIView.as_view()),
    path("event/<int:event_id>/", EventPhotoListAPIView.as_view()),
    path("<int:photo_id>/", PhotoDetailAPIView.as_view()),
    path("<int:photo_id>/like/", ToggleLikeAPIView.as_view()),
    path("<int:photo_id>/favourite/", ToggleFavouriteAPIView.as_view()),
    path("<int:photo_id>/tag/", TagPersonAPIView.as_view()),
    path("<int:photo_id>/comments/", CommentListAPIView.as_view()),
    path("<int:photo_id>/comments/add/", CommentCreateAPIView.as_view()),
    path("upload/multiple/", MultiplePhotoUploadAPIView.as_view()),
    path("my/likes/", MyLikedPhotosAPIView.as_view()),
    path("my/favourites/", MyFavouritedPhotosAPIView.as_view()),
    path("my/tagged/", MyTaggedPhotosAPIView.as_view()),
    path("search/", PhotoSearchAPIView.as_view()),

]
