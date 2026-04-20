import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('access_token');
    if (token) {
      // For now, just assume user is logged in if token exists
      this.userSubject.next({ loggedIn: true });
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register/`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}token/`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        this.userSubject.next({ loggedIn: true });
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userSubject.next(null);
  }

  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}token/refresh/`, { refresh }).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access);
      })
    );
  }
}
