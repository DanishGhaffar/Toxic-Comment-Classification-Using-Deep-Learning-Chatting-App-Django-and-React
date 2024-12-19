# your_app_name/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from .utils import predict_toxicity

@receiver(post_save, sender=Message)
def flag_toxic_messages(sender, instance, created, **kwargs):
    if created and not instance.is_flagged:
        toxicity = predict_toxicity(instance.content)
        if toxicity:
            instance.is_flagged = True
            instance.toxicity = toxicity
            instance.save()
