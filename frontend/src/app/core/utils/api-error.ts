import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(err: HttpErrorResponse, fallback: string): string {
  if (err.status === 0) {
    return 'Cannot reach the server. Make sure the backend is running on http://localhost:8000';
  }
  if (err.status === 401) {
    return 'Your session expired. Please log in again.';
  }
  if (typeof err.error === 'string' && err.error) {
    return err.error;
  }
  if (err.error?.error) {
    return err.error.error;
  }
  if (err.error?.detail) {
    return err.error.detail;
  }
  if (err.error && typeof err.error === 'object') {
    const first = Object.values(err.error)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (typeof first === 'string') return first;
  }
  return fallback;
}
