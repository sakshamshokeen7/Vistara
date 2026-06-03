from rest_framework.permissions import BasePermission

class isUploaderorAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role==('admin','ADMIN'):
            return True
        return obj.uploader == request.user