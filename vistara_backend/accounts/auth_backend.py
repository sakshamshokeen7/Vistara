from django.contrib.auth.backends import ModelBackend
from accounts.models import User

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        print("### EmailBackend CALLED ###", username)

        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            print("### USER NOT FOUND ###")
            return None

        if user.check_password(password):
            print("### PASSWORD MATCH ###")
            return user

        print("### WRONG PASSWORD ###")
        return None

