from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            raise ValueError("Password is required")

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)

        if not password:
            raise ValueError("Superusers must have a password")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # disable username field

    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    full_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    department = models.CharField(max_length=100, blank=True)
    batch = models.CharField(max_length=20, blank=True)

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        EVENT_COORDINATOR = "EVENT_COORDINATOR", "Event Coordinator"
        PHOTOGRAPHER = "PHOTOGRAPHER", "Photographer"
        IMG_MEMBER = "IMG_MEMBER", "IMG Member"
        PUBLIC = "PUBLIC", "Public"

    role = models.CharField(max_length=30, choices=Role.choices, default=Role.PUBLIC)

    is_verified = models.BooleanField(default=False)
    is_omniport_user = models.BooleanField(default=False)

    objects = UserManager()

    def __str__(self):
        return self.email


class EmailOtp(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    otp = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)
