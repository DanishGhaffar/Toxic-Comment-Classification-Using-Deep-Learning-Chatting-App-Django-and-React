from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from PIL import Image  # optional if you want to process images
from django.db.models.signals import post_save
from django.dispatch import receiver
from .predict import *
from .utils import *
from .predict import *

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)
    is_blocked = models.BooleanField(default=False)  # New field

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']



def user_profile_image_upload_path(instance, filename):
    # You can customize this path; below stores images in MEDIA_ROOT/profile_images/<user_id>/
    return f'profile_images/{instance.user.id}/{filename}'

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    image = models.ImageField(upload_to=user_profile_image_upload_path, blank=True, null=True)

    toxic_count = models.PositiveIntegerField(default=0)
    non_toxic_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s profile"

    # Optional: If you want to resize images or process them
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            # Example: resizing image
            img_path = self.image.path
            img = Image.open(img_path)
            img.thumbnail((300, 300))
            img.save(img_path)



@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    is_group = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    updated_content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
     # **New Fields for Flagging System**
    is_flagged = models.BooleanField(default=False)
    toxicity = models.TextField() #it will store "toxic","severe_toxic","Obscene" and soon
    
    class Meta:
        ordering = ('timestamp',)

    def save(self, *args, **kwargs):
            # Preprocess the text
            # Debugging: print the messageupdated value
            
            print(f"messageupdated: {self.content}")

            self.content = replace_toxic_with_antonyms(self.content, toxic_words)

            self.updated_content = self.content
    
            # Debugging: print the messageupdated value
            print(f"messageupdated: {self.updated_content}")
            print(f"message: {self.content}")

            toxicity_check = predict_toxicity(self.content)
            if toxicity_check != "non-toxic":
                self.is_flagged = True
                self.toxicity=toxicity_check

             # Update the user's profile toxic/non-toxic message count
            if self.sender:
                profile = getattr(self.sender, 'profile', None)
                if profile:
                    if toxicity_check == 'non-toxic':
                        profile.non_toxic_count += 1
                    else:
                        profile.toxic_count += 1
                    profile.save()
                else:
                    print("Warning: Profile does not exist for this user.")
            else:
                print("Warning: Message from None user.")

            super(Message, self).save(*args, **kwargs)


    def __str__(self):
        return f'{self.sender.username}: {self.content}'

class Feedback(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.user.email} at {self.timestamp}"

