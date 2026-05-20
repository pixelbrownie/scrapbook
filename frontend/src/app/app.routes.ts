import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'editor',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent),
    canActivate: [authGuard],
  },
  {
    path: 'editor/:slug',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent),
    canActivate: [authGuard],
  },
  {
    path: 'zine/:slug',
    loadComponent: () => import('./features/zine-viewer/zine-viewer.component').then(m => m.ZineViewerComponent),
  },
  {
    path: 'explore',
    loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
  },
  {
    path: 'user/:username',
    loadComponent: () => import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
