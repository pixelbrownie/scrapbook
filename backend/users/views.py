from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.files.storage import default_storage
import cloudinary
import cloudinary.uploader
import uuid

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class PublicProfileView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'username'

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class SearchUsersView(APIView):
    """Search users by username."""
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 1:
            return Response([])

        qs = User.objects.filter(username__icontains=q).order_by('username')[:20]
        if request.user.is_authenticated:
            qs = qs.exclude(pk=request.user.pk)

        serializer = UserSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)
        if target == request.user:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.following.add(target)
        return Response({
            'following': True,
            'followers_count': target.followers.count(),
        })

    def delete(self, request, username):
        target = get_object_or_404(User, username=username)
        request.user.following.remove(target)
        return Response({
            'following': False,
            'followers_count': target.followers.count(),
        })


class UserFollowersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers.all().order_by('username')
        return Response(UserSerializer(followers, many=True, context={'request': request}).data)


class UserFollowingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        following = user.following.all().order_by('username')
        return Response(UserSerializer(following, many=True, context={'request': request}).data)


class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _upload_image(self, request, file):
        cloud_name = cloudinary.config().cloud_name
        cloudinary_configured = bool(
            getattr(settings, 'CLOUDINARY_STORAGE', None)
            or (cloud_name and cloud_name != 'your_cloud_name')
        )

        if cloudinary_configured:
            try:
                upload_data = cloudinary.uploader.upload(
                    file,
                    folder=f"avatars/{request.user.id}",
                    resource_type="image",
                    public_id=f"avatar_{uuid.uuid4().hex[:8]}",
                )
                return upload_data.get('secure_url'), upload_data.get('public_id', '')
            except Exception:
                file.seek(0)

        ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else 'jpg'
        filename = f"avatars/{request.user.id}/{uuid.uuid4().hex[:8]}.{ext}"
        path = default_storage.save(filename, file)
        url = default_storage.url(path)
        if url.startswith('/'):
            url = request.build_absolute_uri(url)
        return url, path

    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image_url, public_id = self._upload_image(request, file)
        except Exception as e:
            return Response({'error': f'Upload failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user = request.user
        user.avatar = image_url
        user.avatar_cloudinary_id = public_id
        user.save(update_fields=['avatar', 'avatar_cloudinary_id'])

        return Response(UserSerializer(user, context={'request': request}).data)
