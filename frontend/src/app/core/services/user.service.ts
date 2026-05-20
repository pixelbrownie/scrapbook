import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  searchUsers(q: string) {
    return this.http.get<User[]>(`${this.base}/search/`, { params: { q } });
  }

  getProfile(username: string) {
    return this.http.get<User>(`${this.base}/users/${username}/`);
  }

  getFollowers(username: string) {
    return this.http.get<User[]>(`${this.base}/users/${username}/followers/`);
  }

  getFollowing(username: string) {
    return this.http.get<User[]>(`${this.base}/users/${username}/following/`);
  }

  follow(username: string) {
    return this.http.post<{ following: boolean; followers_count: number }>(
      `${this.base}/users/${username}/follow/`,
      {},
    );
  }

  unfollow(username: string) {
    return this.http.delete<{ following: boolean; followers_count: number }>(
      `${this.base}/users/${username}/follow/`,
    );
  }

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<User>(`${this.base}/me/avatar/`, form);
  }
}
