import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email?: string;
  bio: string;
  avatar: string;
  zine_count: number;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  is_self?: boolean;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'pb_access';
  private readonly REFRESH_KEY = 'pb_refresh';
  private readonly USER_KEY = 'pb_user';

  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { username: string; email: string; password: string; password2: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/`, data).pipe(
      tap(res => this.persist(res))
    );
  }

  login(data: { username: string; password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login/`, data).pipe(
      tap(res => this.persist(res))
    );
  }

  logout(options?: { returnUrl?: string; reason?: string }) {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    const queryParams: Record<string, string> = {};
    if (options?.returnUrl) queryParams['returnUrl'] = options.returnUrl;
    if (options?.reason) queryParams['reason'] = options.reason;
    this.router.navigate(['/login'], { queryParams });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private persist(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.access);
    localStorage.setItem(this.REFRESH_KEY, res.refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  updateMe(data: Partial<User>) {
    return this.http.patch<User>(`${environment.apiUrl}/auth/me/`, data).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }
}
