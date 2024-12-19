from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from chatapp.online_users import is_user_online

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='user')

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role','is_blocked')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'user')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email  # Ensure email is included
        token['is_blocked']=user.is_blocked
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['is_blocked'] = self.user.is_blocked
        return data





class ProfileSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)  # This ensures the image field returns a URL
    class Meta:
        model = Profile
        fields = ['display_name', 'phone_number', 'image']

class UserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'image_url', 'is_online']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'profile') and obj.profile.image:
            if request:
                return request.build_absolute_uri(obj.profile.image.url)
            else:
                return f"{settings.BASE_DIR}{obj.profile.image.url}"
        return None

    def get_is_online(self, obj):
        return is_user_online(obj.id)

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_profile = ProfileSerializer(source='sender.profile', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'room',
            'sender',
            'sender_username',
            'sender_profile',
            'content',
            'timestamp',
            'is_flagged',
            'toxicity',
        ]
        read_only_fields = ['id', 'sender', 'timestamp', 'is_flagged', 'toxicity']

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'participants', 'is_group', 'messages')

# serializers.py (add in the existing UserActivitySerializer)
class UserActivitySerializer(serializers.ModelSerializer):
    toxic_count = serializers.IntegerField(source='profile.toxic_count', read_only=True)
    non_toxic_count = serializers.IntegerField(source='profile.non_toxic_count', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'toxic_count', 'non_toxic_count', 'is_blocked']

class UserBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'is_blocked']
        read_only_fields = ['id']