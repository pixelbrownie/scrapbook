import { Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'editor/:slug', 
    component: EditorComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
