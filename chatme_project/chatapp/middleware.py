# chatapp/middleware.py

from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from jwt import decode as jwt_decode
from jwt import exceptions
from django.conf import settings

@database_sync_to_async
def get_user(token):
    try:
        untoken = UntypedToken(token)
        decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get('user_id')
        from .models import User
        user = User.objects.get(id=user_id)
        return user
    except (exceptions.DecodeError, User.DoesNotExist):
        return AnonymousUser()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode()
        params = parse_qs(query_string)
        token = params.get('token')
        if token:
            scope['user'] = await get_user(token[0])
        else:
            scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)
