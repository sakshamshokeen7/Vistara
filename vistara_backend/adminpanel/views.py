from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from events.models import Event
from .serializers import AssignRoleSerializer, CreateEventSerializer
from .permissions import IsAdmin

class UserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().values(
            "id", "email", "full_name", "is_active", "role", "is_superuser"
        )
        return Response({"users": list(users)})


class AssignRoleAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AssignRoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Role assigned successfully"})
        return Response(serializer.errors, status=400)

class ToggleUserStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        user_id = request.data.get("user_id")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.is_active = not user.is_active
        user.save()

        return Response({
            "message": "User status updated",
            "is_active": user.is_active
        })

class CreateEventAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = CreateEventSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save(created_by=request.user)
            return Response({"message": "Event created", "event_id": event.id})
        return Response(serializer.errors, status=400)
    
class AdminHomeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Admin Panel Home",
            "endpoints": [
                "/adminpanel/users/",
                "/adminpanel/assign-role/",
                "/adminpanel/toggle-user/",
                "/adminpanel/create-event/"
            ]
        })