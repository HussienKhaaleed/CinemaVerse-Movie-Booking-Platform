import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, options: { [key: string]: any } = {}): Observable<T> {
    return this.http.get<T>(url, { ...options }).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(url: string, body: any, options: { [key: string]: any } = {}): Observable<T> {
    return this.http.post<T>(url, body, { ...options }).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(url: string, body: any, options: { [key: string]: any } = {}): Observable<T> {
    return this.http.put<T>(url, body, { ...options }).pipe(
      catchError(this.handleError)
    );
  }

  patch<T>(url: string, body: any, options: { [key: string]: any } = {}): Observable<T> {
    return this.http.patch<T>(url, body, { ...options }).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(url: string, options: { [key: string]: any } = {}): Observable<T> {
    return this.http.delete<T>(url, { ...options }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Server-side error
      errorMessage = this.getServerErrorMessage(error);
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: return `Bad Request: ${this.getErrorDetail(error)}`;
      case 401: return 'Unauthorized: Please log in again';
      case 403: return 'Forbidden: You do not have permission to access this resource';
      case 404: return 'Not Found: The requested resource does not exist';
      case 500: return 'Server Error: Please try again later';
      default: return `Error Code: ${error.status}, Message: ${this.getErrorDetail(error)}`;
    }
  }

  private getErrorDetail(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    } else if (typeof error.error === 'string') {
      return error.error;
    }
    return error.message;
  }
}
