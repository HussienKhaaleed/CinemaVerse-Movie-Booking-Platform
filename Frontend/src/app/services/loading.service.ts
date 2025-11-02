import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private requestCount = 0;
  loading = signal<boolean>(false);

  startLoading(): void {
    if (this.requestCount === 0) {
      this.loading.set(true);
    }
    this.requestCount++;
  }

  stopLoading(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loading.set(false);
    }
  }

  resetLoading(): void {
    this.requestCount = 0;
    this.loading.set(false);
  }
}
