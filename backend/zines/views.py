from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.shortcuts import get_object_or_404
import cloudinary
import cloudinary.uploader
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from .models import Zine, ZineCell
from .serializers import ZineSerializer, ZineCreateSerializer, ZineCellSerializer


class ZineListCreateView(generics.ListCreateAPIView):
    """Public feed (GET) + Create zine (POST)"""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ZineCreateSerializer
        return ZineSerializer

    def get_queryset(self):
        return Zine.objects.filter(is_public=True).select_related('owner').prefetch_related('cells')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        zine = serializer.save(owner=request.user)
        return Response(ZineSerializer(zine).data, status=status.HTTP_201_CREATED)


class MyZinesView(generics.ListAPIView):
    """User's own zines (private + public)."""
    permission_classes = [IsAuthenticated]
    serializer_class = ZineSerializer

    def get_queryset(self):
        return Zine.objects.filter(owner=self.request.user).prefetch_related('cells')


class ZineDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, delete a zine by slug."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ZineCreateSerializer
        return ZineSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Zine.objects.all().select_related('owner').prefetch_related('cells')
        return Zine.objects.filter(is_public=True).select_related('owner').prefetch_related('cells')

    def update(self, request, *args, **kwargs):
        zine = self.get_object()
        if zine.owner != request.user:
            return Response({'error': 'Not your zine.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        zine = self.get_object()
        if zine.owner != request.user:
            return Response({'error': 'Not your zine.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class TogglePrivacyView(APIView):
    """Toggle is_public for a zine."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, slug):
        zine = get_object_or_404(Zine, slug=slug, owner=request.user)
        zine.is_public = not zine.is_public
        zine.save()
        return Response({'is_public': zine.is_public, 'slug': zine.slug})


class UploadImageView(APIView):
    """Upload image to local media storage and return URL."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('image')
        cell_key = request.data.get('cell_key', 'cover')
        zine_id = request.data.get('zine_id')

        if not file:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            fs = FileSystemStorage()
            filename = fs.save(file.name, file)
            image_url = request.build_absolute_uri(fs.url(filename))

            # Update cell if zine_id and cell_key provided
            if zine_id and cell_key:
                try:
                    zine = Zine.objects.get(id=zine_id, owner=request.user)
                    cell, _ = ZineCell.objects.get_or_create(zine=zine, cell_key=cell_key)
                    cell.image_url = image_url
                    cell.save()

                    if cell_key == 'cover':
                        zine.cover_image_url = image_url
                        zine.save()
                except Zine.DoesNotExist:
                    pass

            return Response({
                'url': image_url,
                'public_id': filename,
                'smart_crop_url': image_url,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateCellView(APIView):
    """Update a single zine cell."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, zine_id, cell_key):
        zine = get_object_or_404(Zine, id=zine_id, owner=request.user)
        cell, _ = ZineCell.objects.get_or_create(zine=zine, cell_key=cell_key)
        serializer = ZineCellSerializer(cell, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
