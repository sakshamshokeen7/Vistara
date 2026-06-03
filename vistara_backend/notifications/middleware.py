from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"].decode()
        token = parse_qs(query_string).get("token")

        if token:
            try:
                validated = UntypedToken(token[0])
                user = await self.get_user(validated)
                scope["user"] = user
            except Exception:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)

    @database_sync_to_async
    def get_user(self, validated_token):
        return JWTAuthentication().get_user(validated_token)
