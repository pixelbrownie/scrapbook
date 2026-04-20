import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZineService {
  private apiUrl = 'http://localhost:8000/api/zines/';

  createZine(zineData: any): Observable<any> {
    return this.http.post(this.apiUrl, zineData);
  }

  getUserZines(): Observable<any> {
    return this.http.get(`${this.apiUrl}mine/`);
  }

  getZineBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${slug}/`);
  }

  updateZine(slug: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}${slug}/`, data);
  }
}
