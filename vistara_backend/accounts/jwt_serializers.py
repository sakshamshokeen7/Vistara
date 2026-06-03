from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model


User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data["email"]
        password = data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_verified:
            raise serializers.ValidationError("Please verify your OTP before login")

        refresh = RefreshToken.for_user(user)

        role = (
            "ADMIN"
            if getattr(user, "is_superuser", False)
            else getattr(user, "role", "PUBLIC")
        )

        return {
            "message": "Login successful",
            "email": user.email,
            "role": role,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
