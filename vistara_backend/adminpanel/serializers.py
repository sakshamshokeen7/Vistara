from rest_framework import serializers
from accounts.models import User
from events.models import Event


class AssignRoleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role_name = serializers.CharField()

    def validate(self, attrs):
        try:
            user = User.objects.get(id=attrs['user_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")

        valid_roles = [c[0] for c in User.Role.choices]
        if attrs['role_name'] not in valid_roles:
            raise serializers.ValidationError({"role_name": "Invalid role name."})

        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        role_name = self.validated_data['role_name']

        if role_name == 'ADMIN':
            user.is_superuser = True
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False

        user.role = role_name
        user.save()
        return user


class CreateEventSerializer(serializers.ModelSerializer):
    coordinators = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    cover_upload = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            'name', 'slug', 'description', 'start_datetime', 'end_datetime', 'location',
            'is_public', 'qr_code_url', 'coordinators', 'cover_upload'
        ]

    def validate(self, attrs):
        if not attrs.get('slug') and attrs.get('name'):
            from django.utils.text import slugify
            base = slugify(attrs['name'])[:50] or 'event'
            slug = base
            i = 1
            while Event.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            attrs['slug'] = slug
        return attrs

    def create(self, validated_data, **kwargs):
        coords = validated_data.pop('coordinators', [])
        cover = validated_data.pop('cover_upload', None)
        created_by = kwargs.get('created_by')
        event = Event.objects.create(**validated_data)
        if coords:
            try:
                users = User.objects.filter(id__in=coords)
                event.coordinators.set(users)
            except Exception:
                pass

        if cover is not None:
            from photos.models import Photo
            try:
                photo = Photo.objects.create(
                    event=event,
                    uploader=created_by if created_by is not None else None,
                    original_file=cover,
                    display_file=cover,
                    thumbnail_file=cover,
                )
                event.cover_photo = photo
                event.save()
            except Exception:
                pass

        return event

