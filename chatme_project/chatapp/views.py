#views.py
from rest_framework import generics, permissions
from .serializers import *
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminOrModerator
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile

    def put(self, request, *args, **kwargs):
        # For full updates (requiring all fields)
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        # For partial updates (just a few fields)
        return self.partial_update(request, *args, **kwargs)

class ChatRoomListCreateView(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # For a direct chat, name could be generated from participant usernames
        # For a group chat, the name can be provided in the request.
        room = serializer.save()
        room.participants.add(self.request.user)  # Add creator by default

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['pk']
        return Message.objects.filter(room__id=room_id).order_by('timestamp')
    

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Optionally exclude the logged-in user if you don't want them listed
        return User.objects.all().exclude(id=self.request.user.id)
    
class ChatRoomListCreateView(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.save()
        room.participants.add(self.request.user)
        # If this is a direct chat (not group) and other_user_id provided
        if not room.is_group and 'other_user_id' in self.request.data:
            other_user_id = self.request.data['other_user_id']
            other_user = User.objects.get(id=other_user_id)
            room.participants.add(other_user)

class FlaggedMessagesListView(generics.ListAPIView):
    """
    Retrieve a list of all flagged messages.
    Accessible only to admins and moderators.
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsAdminOrModerator]

    def get_queryset(self):
        return Message.objects.filter(is_flagged=True).order_by('-timestamp')
    
class DeleteMessageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrModerator]

    def delete(self, request, pk, format=None):
        """
        Handle DELETE requests to delete a message by ID.
        """
        message = get_object_or_404(Message, id=pk)

        # Permission is already checked by IsAdminOrModerator
        message.delete()
        logger.info(f"Message {pk} deleted by user {request.user.username}.")
        return Response(status=status.HTTP_204_NO_CONTENT)

class FeedbackView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'Feedback content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        Feedback.objects.create(user=request.user, content=content)
        return Response({'detail': 'Feedback submitted successfully.'}, status=status.HTTP_201_CREATED)
    
class FeedbackListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrModerator]

    def get(self, request):
        feedbacks = Feedback.objects.all().order_by('-timestamp')
        data = []
        for f in feedbacks:
            data.append({
                'id': f.id,
                'username': f.user.username,
                'feedback': f.content,
                'timestamp': f.timestamp.isoformat(),
            })
        return Response(data, status=status.HTTP_200_OK)
    
class FeedbackDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrModerator]

    def delete(self, request, pk):
        try:
            feedback = Feedback.objects.get(pk=pk)
        except Feedback.DoesNotExist:
            return Response({'detail': 'Feedback not found.'}, status=status.HTTP_404_NOT_FOUND)

        feedback.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ChatRoomDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        # Attempt to retrieve the room by ID
        room = get_object_or_404(ChatRoom, pk=pk)

        # Optional: Add checks (e.g., if room.is_group is True or if user has permissions)
        # Example: Only delete if is_group == True
        if not room.is_group:
            return Response({'detail': 'Cannot delete a direct chat.'}, status=status.HTTP_403_FORBIDDEN)

        # Optional: Check if the request user is a participant or an admin
        # if request.user not in room.participants.all():
        #     return Response({'detail': 'You are not a participant of this group.'}, status=status.HTTP_403_FORBIDDEN)

        # If checks pass, delete the room
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserActivityListAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Adjust if needed
    
    def get(self, request, *args, **kwargs):
        users = User.objects.select_related('profile').all()  
        serializer = UserActivitySerializer(users, many=True)
        return Response(serializer.data)
    
class BlockUserAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Adjust permissions as needed

    def patch(self, request, user_id):
        # Ensure that only admin or moderator can block
        if request.user.role not in ['admin', 'moderator']:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserBlockSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)