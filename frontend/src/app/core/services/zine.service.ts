import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ZineCell {
  id?: number;
  cell_key: string;
  image_url: string;
  cloudinary_public_id: string;
  text_content: string;
  text_color: string;
  font_size: number;
  bg_color: string;
}

export interface Zine {
  id: string;
  owner: { id: number; username: string; avatar: string };
  title: string;
  slug: string;
  description: string;
  is_public: boolean;
  cover_image_url: string;
  theme_color: string;
  cells: ZineCell[];
  created_at: string;
  updated_at: string;
}

import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ZineService {
  private base = `${environment.apiUrl}/zines`;

  constructor(private http: HttpClient) {}

  // Public feed
  getPublicZines() {
    return this.http.get<{results: Zine[]}>(`${this.base}/`).pipe(map(res => res.results || (res as any)));
  }

  // My zines
  getMyZines() {
    return this.http.get<{results: Zine[]}>(`${this.base}/mine/`).pipe(map(res => res.results || (res as any)));
  }

  // Public zines by username
  getUserPublicZines(username: string) {
    return this.http.get<{results: Zine[]}>(`${this.base}/user/${username}/`).pipe(
      map(res => res.results || (res as any)),
    );
  }

  // Get one
  getZine(slug: string) {
    return this.http.get<Zine>(`${this.base}/${slug}/`);
  }

  // Create
  createZine(data: { title: string; description?: string; is_public?: boolean; theme_color?: string }) {
    return this.http.post<Zine>(`${this.base}/`, data);
  }

  // Update
  updateZine(slug: string, data: Partial<Zine>) {
    return this.http.patch<Zine>(`${this.base}/${slug}/`, data);
  }

  // Delete
  deleteZine(slug: string) {
    return this.http.delete(`${this.base}/${slug}/`);
  }

  // Toggle privacy
  togglePrivacy(slug: string) {
    return this.http.patch<{ is_public: boolean; slug: string }>(`${this.base}/${slug}/toggle-privacy/`, {});
  }

  // Update a single cell
  updateCell(zineId: string, cellKey: string, data: Partial<ZineCell>) {
    return this.http.patch<ZineCell>(`${this.base}/${zineId}/cell/${cellKey}/`, data);
  }

  // Upload image to Cloudinary (via Django)
  uploadImage(file: File, zineId: string, cellKey: string) {
    const form = new FormData();
    form.append('image', file);
    form.append('zine_id', zineId);
    form.append('cell_key', cellKey);
    return this.http.post<{ url: string; public_id: string; smart_crop_url: string }>(
      `${this.base}/upload/image/`, form
    );
  }
}
