# src/chatapp/permissions.py

from rest_framework.permissions import BasePermission

class IsAdminOrModerator(BasePermission):
    """
    Custom permission to only allow admins or moderators to delete messages.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'moderator']
