from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    # Rooms
    path('rooms/', ChatRoomListCreateView.as_view(), name='chat_rooms'),
    path('rooms/<int:pk>/', ChatRoomDetailView.as_view(), name='chat_room_detail'),
    path('all/', UserListView.as_view(), name='user_list'),
    path('rooms/<int:pk>/messages/', MessageListView.as_view(), name='room_messages'),

    # Flagged Messages
    path('flagged-messages/', FlaggedMessagesListView.as_view(), name='flagged-messages'),
    path('delete-message/<int:pk>/', DeleteMessageView.as_view(), name='delete-message'),

    # Feedback
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('feedback-list/', FeedbackListView.as_view(), name='feedback-list'),
    path('feedback/<int:pk>/', FeedbackDetailView.as_view(), name='feedback-detail'),

    # User Activity Tracker
    path('user-activity-list/', UserActivityListAPIView.as_view(), name='user-activity-list'),

    # Block Users
    path('user-block/<int:user_id>/', BlockUserAPIView.as_view(), name='user-block')
]
