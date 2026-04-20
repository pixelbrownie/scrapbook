import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZineService {
  private apiUrl = 'http://localhost:8000/api/zines/';

  constructor(private http: HttpClient) {}

  createZine(zineData: any): Observable<any> {
    return this.http.post(this.apiUrl, zineData);
  }

  updatePage(zineId: number, pageField: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append(pageField, file);
    return this.http.patch(`${this.apiUrl}${zineId}/`, formData);
  }
}
