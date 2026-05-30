from rest_framework import serializers
from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = "__all__"
        read_only_fields = ["id", "created_at", "uploader", "view_count"]
        
class PhotoLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = photo_like
        fields = "__all__"


class PhotoFavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = photo_favourite
        fields = "__all__"

class PersonTagSerializer(serializers.ModelSerializer):
    tagged_user_name = serializers.SerializerMethodField()

    class Meta:
        model = PersonTag
        fields = [
            "id",
            "tagged_user",
            "tagged_user_name",
            "face_box",
            "created_at",
        ]
        extra_kwargs = {
            "face_box": {"required": False, "allow_null": True},
        }

    def get_tagged_user_name(self, obj):
        user = obj.tagged_user
        return user.full_name or user.email.split("@")[0]



class PhotoCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = PhotoComment
        fields = ["id", "user_id", "user_name", "text", "created_at", "parent_comment", "replies"]

    def get_user_name(self, obj):
        user = obj.user
        return user.full_name or user.email.split("@")[0]

    def get_replies(self, obj):
        if obj.parent_comment is None:
            replies = obj.replies.all().order_by("-created_at")
            return PhotoCommentSerializer(replies, many=True).data
        return []


class AddCommentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=500)
    parent_comment_id = serializers.IntegerField(required=False, allow_null=True)

class EventPhotoSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    favourites_count = serializers.IntegerField(read_only=True)
    uploader_name = serializers.SerializerMethodField()
    thumbnail_file = serializers.SerializerMethodField()

    def get_uploader_name(self, obj):
        user = obj.uploader
        if user:
            return user.full_name or user.email.split("@")[0]
        return "Unknown"

    def get_thumbnail_file(self, obj):
        request = self.context.get("request")
        # Fallback: return thumbnail if present, otherwise use display or original
        file_field = None
        if getattr(obj, "thumbnail_file", None):
            file_field = obj.thumbnail_file
        elif getattr(obj, "display_file", None):
            file_field = obj.display_file
        elif getattr(obj, "original_file", None):
            file_field = obj.original_file

        if file_field and hasattr(file_field, "url"):
            return request.build_absolute_uri(file_field.url)
        return None

    class Meta:
        model = Photo
        fields = [
            "id",
            "thumbnail_file",
            "uploader_name",
            "likes_count",
            "comments_count",
            "favourites_count",
            "created_at",
            "view_count",
            "tags",
        ]

class PhotoDetailSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    favourites_count = serializers.IntegerField(read_only=True)
    uploader_name = serializers.SerializerMethodField()
    person_tags = PersonTagSerializer(many=True, read_only=True)

    def get_uploader_name(self, obj):
        user = obj.uploader
        if user:
            return user.full_name or user.email.split("@")[0]
        return "Unknown"

    class Meta:
        model = Photo
        fields = [
            "id",
            "original_file",
            "thumbnail_file",
            "uploader_name",
            "likes_count",
            "comments_count",
            "favourites_count",
            "view_count",
            "created_at",
            "event",
            "person_tags",
            "tags",
        ]

class MultiplePhotoUploadSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    files = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False
    )
