from django.urls import path
from .views import (
    AdminHomeAPIView, UserListAPIView, AssignRoleAPIView,
    ToggleUserStatusAPIView, CreateEventAPIView
)

urlpatterns = [
    path("users/", UserListAPIView.as_view(), name="admin-users"),
    path("assign-role/", AssignRoleAPIView.as_view(), name="assign-role"),
    path("toggle-user/", ToggleUserStatusAPIView.as_view(), name="toggle-user"),
    path("create-event/", CreateEventAPIView.as_view(), name="create-event"),
    path("", AdminHomeAPIView.as_view(), name="admin-home"),
]
