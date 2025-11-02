import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_KEY = 'auth_token_expiry';
  private readonly DEFAULT_TOKEN_EXPIRY = 30 * 24 * 60 * 60;
  private api = environment.apiUrl;
  private clientID = environment.googleClientId;

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  // Observable for other services to react to auth changes
  private onLoginCallbacks: Array<(userId: string) => void> = [];
  private onLogoutCallbacks: Array<() => void> = [];

  constructor(
    private httpService: HttpService,
    private router: Router,
    private storage: StorageService
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Register callback to be called after user login
   */
  onLogin(callback: (userId: string) => void): void {
    this.onLoginCallbacks.push(callback);
  }

  /**
   * Register callback to be called after user logout
   */
  onLogout(callback: () => void): void {
    this.onLogoutCallbacks.push(callback);
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    const user = this.currentUser();
    return user ? user.id : null;
  }

  private loadUserFromStorage() {
    // Try to load from sessionStorage first (current session)
    const userJson = this.storage.getSessionItem<string>(this.STORAGE_KEY);
    const token = this.storage.getSessionItem<string>(this.TOKEN_KEY);
    const expiry = this.storage.getSessionItem<string>(this.TOKEN_EXPIRY_KEY);

    // If not in session, try cookies (persistent)
    if (!userJson || !token || !expiry) {
      const cookieUser = this.storage.getCookie<User>('auth_user');
      const cookieToken = this.storage.getCookie<string>('auth_token');
      const cookieExpiry = this.storage.getCookie<string>('auth_token_expiry');

      if (cookieUser && cookieToken && cookieExpiry) {
        const expiryTime = parseInt(cookieExpiry, 10);
        if (Date.now() < expiryTime) {
          this.currentUser.set(cookieUser);
          this.isAuthenticated.set(true);
          // Restore to session storage
          this.storage.setSessionItem(this.STORAGE_KEY, cookieUser);
          this.storage.setSessionItem(this.TOKEN_KEY, cookieToken);
          this.storage.setSessionItem(this.TOKEN_EXPIRY_KEY, cookieExpiry);
          // Notify other services about the restored session
          setTimeout(() => this.notifyLogin(cookieUser.id), 0);
          return;
        } else {
          this.logout();
          return;
        }
      }
      return;
    }

    const expiryTime = parseInt(expiry, 10);
    if (Date.now() < expiryTime) {
      const user = JSON.parse(userJson);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      // Notify other services about the restored session
      setTimeout(() => this.notifyLogin(user.id), 0);
    } else {
      this.logout();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.httpService.post<AuthResponse>(`${this.api}/auth/signin`, { email, password }).pipe(
      tap((res: AuthResponse) => this.handleAuthSuccess(res)),
      catchError((err) => {
        console.error('Login failed', err);
        return throwError(() => err);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.httpService.post<AuthResponse>(`${this.api}/auth/register`, { name, email, password }).pipe(
      tap((res: AuthResponse) => this.handleAuthSuccess(res)),
      catchError((err) => {
        console.error('Register failed', err);
        return throwError(() => err);
      })
    );
  }

  loginWithGoogle(buttonElementId?: string) {
    if (!(window as any).google) {
      console.error('Google Identity Service not loaded');
      return;
    }

    (window as any).google.accounts.id.initialize({
      client_id: this.clientID,
      callback: (response: any) => this.handleGoogleToken(response),
    });

    if (buttonElementId) {
      const buttonElement = document.getElementById(buttonElementId);
      if (buttonElement) {
        (window as any).google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
      }
    } else {
      (window as any).google.accounts.id.prompt();
    }
  }

  loginWithGoogleBackend(token: string) {
    return this.httpService.post<AuthResponse>(`${this.api}/auth/google`, { token }).pipe(
      tap((response: AuthResponse) => this.handleAuthSuccess(response)),
      catchError((error) => {
        console.error('Google login backend failed:', error);
        return throwError(() => error);
      })
    );
  }

  handleGoogleToken(response: any) {
    const token = response.credential;
    this.httpService
      .post<AuthResponse>(`${this.api}/auth/google`, { token })
      .pipe(
        tap((res: AuthResponse) => this.handleAuthSuccess(res)),
        catchError((err) => {
          console.error('Google login failed', err);
          return of(null);
        })
      )
      .subscribe();
  }

  private handleAuthSuccess(res: AuthResponse) {
    console.log('🔐 handleAuthSuccess called with:', res);

    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);

    const expiryInSeconds = res.expiresIn || this.DEFAULT_TOKEN_EXPIRY;
    const expiryDate = new Date().getTime() + expiryInSeconds * 1000;

    console.log('🔐 Storing token:', res.token.substring(0, 20) + '...');
    console.log('🔐 Token expiry:', new Date(expiryDate).toISOString());

    // Store in sessionStorage (cleared on tab close)
    this.storage.setSessionItem(this.STORAGE_KEY, JSON.stringify(res.user));
    this.storage.setSessionItem(this.TOKEN_KEY, res.token);
    this.storage.setSessionItem(this.TOKEN_EXPIRY_KEY, expiryDate.toString());

    // Also store in cookies for persistence (survives browser close)
    this.storage.setCookie('auth_user', res.user, 30);
    this.storage.setCookie('auth_token', res.token, 30);
    this.storage.setCookie('auth_token_expiry', expiryDate.toString(), 30);

    console.log('🔐 Checking stored token in sessionStorage:', sessionStorage.getItem('auth_token')?.substring(0, 20) + '...');
    console.log('🔐 Calling notifyLogin with userId:', res.user.id);

    // Notify other services about login
    this.notifyLogin(res.user.id);
  }

  private notifyLogin(userId: string): void {
    console.log('🔐 notifyLogin: Notifying', this.onLoginCallbacks.length, 'callbacks');
    this.onLoginCallbacks.forEach((callback, index) => {
      try {
        console.log('🔐 Calling login callback #', index + 1);
        callback(userId);
      } catch (error) {
        console.error('Error in login callback:', error);
      }
    });
  }

  private notifyLogout(): void {
    this.onLogoutCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in logout callback:', error);
      }
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.httpService.post<AuthResponse>(`${this.api}/auth/refresh`, {}).pipe(
      tap((res: AuthResponse) => this.handleAuthSuccess(res)),
      catchError((err) => {
        console.error('Token refresh failed', err);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getToken(): string | null {
    return this.storage.getSessionItem<string>(this.TOKEN_KEY) ||
           this.storage.getCookie<string>('auth_token');
  }

  isTokenExpiringSoon(): boolean {
    const expiry = this.storage.getSessionItem<string>(this.TOKEN_EXPIRY_KEY) ||
                   this.storage.getCookie<string>('auth_token_expiry');
    if (!expiry) return false;
    const expiryTime = parseInt(expiry, 10);
    const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
    return expiryTime < oneDayFromNow;
  }

  isTokenExpired(): boolean {
    const expiry = this.storage.getSessionItem<string>(this.TOKEN_EXPIRY_KEY) ||
                   this.storage.getCookie<string>('auth_token_expiry');
    if (!expiry) return true;
    const expiryTime = parseInt(expiry, 10);
    return Date.now() >= expiryTime;
  }

  verifySession(): Observable<boolean> {
    return this.httpService.get<{ valid: boolean }>(`${this.api}/auth/verify`).pipe(
      tap((res: { valid: boolean }) => {
        if (!res.valid) {
          this.logout();
        }
      }),
      catchError(() => {
        this.logout();
        return of(false);
      }),
      map((res: { valid: boolean } | boolean) => (typeof res === 'boolean' ? res : res.valid))
    );
  }

  updateUserProfile(updates: Partial<User>): Observable<User> {
    return this.httpService.patch<User>(`${this.api}/users/me`, updates).pipe(
      tap((user: User) => {
        this.currentUser.set(user);
        this.storage.setSessionItem(this.STORAGE_KEY, JSON.stringify(user));
        this.storage.setCookie('auth_user', user, 30);
      }),
      catchError((err) => {
        console.error('Profile update failed', err);
        return throwError(() => err);
      })
    );
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    // Notify other services about logout (clear their data)
    this.notifyLogout();

    // Clear session storage
    this.storage.removeSessionItem(this.STORAGE_KEY);
    this.storage.removeSessionItem(this.TOKEN_KEY);
    this.storage.removeSessionItem(this.TOKEN_EXPIRY_KEY);

    // Clear cookies
    this.storage.deleteCookie('auth_user');
    this.storage.deleteCookie('auth_token');
    this.storage.deleteCookie('auth_token_expiry');

    this.router.navigate(['/']);
  }
}
