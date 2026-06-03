from autumn_photo.settings import OMNIPORT_TOKEN_URL
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import redirect
from django.conf import settings
import requests

from .serializers import RegisterSerializer, VerifyOTPSerializer
from .jwt_serializers import LoginSerializer    
from .models import User
from .omniport import get_omniport_login_url, get_tokens, get_user_info
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered. OTP sent to email."}, status=200)
        return Response(serializer.errors, status=400)


class VerifyOTPAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Account verified successfully"}, status=200)
        return Response(serializer.errors, status=400)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        
        if serializer.is_valid():
            return Response(serializer.validated_data, status=200) 
        
        return Response(serializer.errors, status=400)


class OmniportLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return redirect(get_omniport_login_url())



class OmniportCallbackAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response({"error": "Authorization code missing"}, status=400)

        try:
            from requests.auth import HTTPBasicAuth
            import logging
            logger = logging.getLogger(__name__)
            
            token_res = requests.post(
                settings.OMNIPORT_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.OMNIPORT_REDIRECT_URI,
                },
                auth=HTTPBasicAuth(settings.OMNIPORT_CLIENT_ID, settings.OMNIPORT_CLIENT_SECRET),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            )
            logger.error(f"Token exchange status: {token_res.status_code}")
            logger.error(f"Token exchange response: {token_res.text[:500]}")
            if token_res.status_code != 200:
                return Response({
                    "error": "Token exchange failed",
                    "status": token_res.status_code,
                    "response": token_res.text[:1000]  
                }, status=400)

            tokens = token_res.json()
            access_token = tokens.get("access_token")

            if not access_token:
                return Response({"error": "No access token received", "data": tokens}, status=400)

            
            user_res = requests.get(
                settings.OMNIPORT_USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if user_res.status_code != 200:
                return Response({
                    "error": "Failed to get user info",
                    "status": user_res.status_code,
                    "response": user_res.text
                }, status=400)

            data = user_res.json()

            
            contact_info = data.get("contactInformation", {})
            email = contact_info.get("instituteWebmailAddress") or contact_info.get("emailAddress")
            
            person = data.get("person", {})
            full_name = person.get("fullName", "")

            if not email:
                return Response({"error": "No email found in user data", "data": data}, status=400)

            
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": full_name,
                    "is_verified": True,
                    "is_omniport_user": True,
                },
            )

            
            refresh = RefreshToken.for_user(user)

            
            request.session["jwt_access"] = str(refresh.access_token)
            request.session["jwt_refresh"] = str(refresh)
            request.session["email"] = user.email
            request.session["role"] = user.role

            return redirect("http://localhost:5173/omniport/callback")
        
        except requests.exceptions.RequestException as e:
            return Response({"error": "Network error", "message": str(e)}, status=500)
        except Exception as e:
            return Response({"error": "Unexpected error", "message": str(e)}, status=500)


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = "ADMIN" if getattr(user, "is_superuser", False) else getattr(user, "role", "PUBLIC")

        return Response({
            "email": user.email,
            "full_name": user.full_name,
            "role": role,
            "is_superuser": getattr(user, "is_superuser", False),
        })


class OmniportSessionAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if "jwt_access" not in request.session:
            return Response({"error": "No active session"}, status=401)

        return Response({
            "access": request.session["jwt_access"],
            "refresh": request.session["jwt_refresh"],
            "email": request.session["email"],
            "role": request.session["role"],
        })

