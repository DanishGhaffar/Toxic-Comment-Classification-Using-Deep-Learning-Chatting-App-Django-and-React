# chatapp/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message
from .serializers import MessageSerializer
from .online_users import set_user_online, set_user_offline

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        user = self.scope["user"]
        if user.is_authenticated:
            # Mark user as online
            await self.mark_user_online(user.id)

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        user = self.scope["user"]
        if user.is_authenticated:
            # Mark user as offline
            await self.mark_user_offline(user.id)

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def mark_user_online_sync(self, user_id):
        set_user_online(user_id)

    async def mark_user_online(self, user_id):
        await self.mark_user_online_sync(user_id)

    @database_sync_to_async
    def mark_user_offline_sync(self, user_id):
        set_user_offline(user_id)

    async def mark_user_offline(self, user_id):
        await self.mark_user_offline_sync(user_id)

    @database_sync_to_async
    def save_message_sync(self, user, room_name, content):
        room = ChatRoom.objects.get(name=room_name)
        return Message.objects.create(room=room, sender=user, content=content)

    @database_sync_to_async
    def serialize_message_sync(self, message_obj):
        serializer = MessageSerializer(message_obj, context={'request': None})
        return serializer.data

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        user = self.scope["user"]

        if not user.is_authenticated:
            # Optionally handle unauthenticated users
            return

        # Save message to DB
        message_obj = await self.save_message_sync(user, self.room_name, message)
        serialized_message = await self.serialize_message_sync(message_obj)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': serialized_message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
