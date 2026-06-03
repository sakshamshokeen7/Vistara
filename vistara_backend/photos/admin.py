from django.contrib import admin
from .models import Photo, photo_like, photo_favourite, PersonTag, PhotoComment

# Register your models here
admin.site.register(Photo)
admin.site.register(photo_like)
admin.site.register(photo_favourite)
admin.site.register(PersonTag)
admin.site.register(PhotoComment)
