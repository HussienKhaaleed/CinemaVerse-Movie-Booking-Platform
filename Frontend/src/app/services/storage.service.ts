import { Injectable } from '@angular/core';

/**
 * Storage Service - Centralized storage management
 * Uses sessionStorage for temporary data (cleared on tab close)
 * Uses cookies for persistent data (survives browser close)
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly COOKIE_EXPIRY_DAYS = 30;

  constructor() {}

  // ==================== Session Storage Methods ====================
  // Session storage is cleared when the browser tab is closed

  setSessionItem(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting session item:', error);
    }
  }

  getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting session item:', error);
      return null;
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing session item:', error);
    }
  }

  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // ==================== Cookie Methods ====================
  // Cookies persist across browser sessions

  setCookie(name: string, value: any, days: number = this.COOKIE_EXPIRY_DAYS): void {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      const cookieValue = typeof value === 'string' ? value : JSON.stringify(value);
      document.cookie = `${name}=${encodeURIComponent(
        cookieValue
      )};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  }

  getCookie<T>(name: string): T | null {
    try {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
          try {
            return JSON.parse(value);
          } catch {
            return value as T;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  }

  deleteCookie(name: string): void {
    try {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;Secure`;
    } catch (error) {
      console.error('Error deleting cookie:', error);
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Check if a session item exists
   */
  hasSessionItem(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Clear all storage (session and cookies)
   */
  clearAll(cookieNames: string[]): void {
    this.clearSession();
    cookieNames.forEach((name) => this.deleteCookie(name));
  }
}
