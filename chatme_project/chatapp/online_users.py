# chatapp/online_users.py
import redis
from django.conf import settings

# Initialize Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0)  # Adjust if using a different host/port

ONLINE_USERS_SET = 'online_users'

def set_user_online(user_id):
    """
    Add the user ID to the online users set.
    """
    redis_client.sadd(ONLINE_USERS_SET, user_id)

def set_user_offline(user_id):
    """
    Remove the user ID from the online users set.
    """
    redis_client.srem(ONLINE_USERS_SET, user_id)

def is_user_online(user_id):
    """
    Check if the user ID is in the online users set.
    Returns True if online, False otherwise.
    """
    return redis_client.sismember(ONLINE_USERS_SET, user_id)
