from django.contrib import admin
from .models import *
# Register your models here.
class UserAdmin(admin.ModelAdmin):
   
    list_display = ['role','username', 'email','is_blocked']
    list_editable=['is_blocked']
    list_display_links=['role']

"""
class ProfileAdmin(admin.ModelAdmin):
    list_editable = ['verified','moderator']
    list_display = ['user', 'full_name' ,'verified','moderator','non_toxic_message_count','toxic_message_count']



class ChatMessageAdmin(admin.ModelAdmin):
    list_editable = ['is_read', 'message']
    list_display = ['user','sender', 'reciever', 'is_read', 'message','messageupdated','pmessage','toxicity']
"""
admin.site.register(User, UserAdmin)