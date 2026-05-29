from rest_framework import serializers
from .models import Event
from accounts.models import User
from photos.models import Photo

class CoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']

class EventSerializer(serializers.ModelSerializer):
    coordinators = CoordinatorSerializer(many=True, read_only=True)
    coordinator_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source='coordinators',
        write_only=True
    )

    cover = serializers.SerializerMethodField()
    cover_upload = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'start_datetime',
            'end_datetime',
            'location',
            'qr_code_url',
            'is_public',
            'created_at',            
            'cover_photo',
            'cover',
            'created_by',
            'coordinators',
            'coordinator_ids',
            'cover_upload',
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

    def get_cover(self, obj):
        photo = obj.cover_photo
        if not photo:
            return None

        
        if getattr(photo, 'thumbnail_file', None) and photo.thumbnail_file:
            return photo.thumbnail_file.url

        if getattr(photo, 'display_file', None) and photo.display_file:
            return photo.display_file.url

        if getattr(photo, 'original_file', None) and photo.original_file:
            return photo.original_file.url

        return None

    def update(self, instance, validated_data):
        cover_upload = validated_data.pop('cover_upload', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle cover photo upload
        if cover_upload:
            # Create a new Photo object for the cover
            photo = Photo.objects.create(
                event=instance,
                uploader=self.context['request'].user,
                original_file=cover_upload,
                display_file=cover_upload,
                thumbnail_file=cover_upload,
            )
            instance.cover_photo = photo
        
        instance.save()
        return instance
