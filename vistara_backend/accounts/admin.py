from django.contrib import admin
from .models import User,EmailOtp

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "is_verified", "is_omniport_user")

admin.site.register(EmailOtp)
