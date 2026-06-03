# accounts/serializers.py

from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import User, EmailOtp as EmailOTP
from django.core.mail import send_mail
from django.conf import settings

class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "full_name", 
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        full_name = validated_data.pop("full_name", "").strip()

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=full_name,
            is_verified=False
        )

        otp = get_random_string(6, "0123456789")
        EmailOTP.objects.create(user=user, otp=otp)
        send_mail(
            subject="Your OTP for Vistara",
            message=f"Your verification OTP is {otp}. It expires in 5 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            )

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

    def validate(self, data):
        user = User.objects.filter(email=data["email"]).first()
        if not user:
            raise serializers.ValidationError("User not found")

        otp_obj = EmailOTP.objects.filter(user=user, otp=data["otp"], is_used=False).first()
        if not otp_obj:
            raise serializers.ValidationError("Invalid OTP")

        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired")

        data["user"] = user
        data["otp_obj"] = otp_obj
        return data

    def save(self):
        user = self.validated_data["user"]
        otp_obj = self.validated_data["otp_obj"]

        otp_obj.is_used = True
        otp_obj.save()

        user.is_verified = True
        user.save()

        return {"message": "Account verified successfully"}
