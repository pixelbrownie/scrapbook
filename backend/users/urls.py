from django.urls import path
from .views import (
    RegisterView, LoginView, MeView, PublicProfileView,
    SearchUsersView, FollowUserView, UserFollowersView, UserFollowingView,
    AvatarUploadView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('me/avatar/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('search/', SearchUsersView.as_view(), name='search-users'),
    path('users/<str:username>/', PublicProfileView.as_view(), name='public-profile'),
    path('users/<str:username>/follow/', FollowUserView.as_view(), name='follow-user'),
    path('users/<str:username>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('users/<str:username>/following/', UserFollowingView.as_view(), name='user-following'),
    path('profile/<str:username>/', PublicProfileView.as_view(), name='profile-legacy'),
]
