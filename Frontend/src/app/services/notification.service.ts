import { Injectable } from '@angular/core';

/**
 * Simple notification service
 * This is a placeholder service for future implementation
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {}

  /**
   * Show a success notification (placeholder)
   */
  success(message: string): void {
    console.log('Success:', message);
  }

  /**
   * Show an error notification (placeholder)
   */
  error(message: string): void {
    console.log('Error:', message);
  }

  /**
   * Show an info notification (placeholder)
   */
  info(message: string): void {
    console.log('Info:', message);
  }

  /**
   * Show a warning notification (placeholder)
   */
  warning(message: string): void {
    console.log('Warning:', message);
  }
}
