from rest_framework import permissions

class ISADMIN_OR_COORDINATOR(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if getattr(user, 'is_superuser', False):
            return True

        role = getattr(user, 'role', '') or ''
        if str(role).upper() == 'ADMIN':
            return True

        try:
            return obj.coordinators.filter(id=user.id).exists()
        except Exception:
            return False