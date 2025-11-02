import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';

export interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  movie: {
    _id: string;
    title: string;
    posterImage: string;
  };
  showTime: string;
  ticketsCount: number;
  amountPaid: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  status?: 'upcoming' | 'in-progress' | 'completed';
}

export interface BookingsResponse {
  status: string;
  count: number;
  data: Booking[];
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private api = `${environment.apiUrl}/bookings`;
  private bookings = signal<Booking[]>([]);

  // Computed signals
  bookingCount = computed(() => this.bookings().length);
  upcomingBookings = computed(() =>
    this.bookings().filter(b => b.status === 'upcoming')
  );
  completedBookings = computed(() =>
    this.bookings().filter(b => b.status === 'completed')
  );

  constructor(private http: HttpService) {
    console.log('🎫 BookingService: Constructor initialized');
    // Register callbacks with AuthService
    const authService = inject(AuthService);
    authService.onLogin((userId) => {
      console.log('🎫 BookingService: onLogin callback triggered for user:', userId);
      this.getMyBookings().subscribe({
        next: (response) => console.log('🎫 BookingService: Bookings loaded:', response),
        error: (err) => console.error('🎫 BookingService: Error loading bookings:', err)
      });
    });
    authService.onLogout(() => {
      console.log('🎫 BookingService: onLogout callback triggered');
      this.clearBookings();
    });
  }

  createCheckoutSession(items: Array<{ movieId: string, ticketsCount: number, showTime: string }>): Observable<{ status: string; sessionUrl: string }> {
    return this.http.post<{ status: string; sessionUrl: string }>(`${this.api}/create-checkout-session`, {
      items,
    });
  }

  getMyBookings(): Observable<BookingsResponse> {
    console.log('🎫 BookingService: Fetching bookings from API...');
    return this.http.get<BookingsResponse>(`${this.api}/my-bookings`).pipe(
      tap((response) => {
        console.log('🎫 BookingService: API Response:', response);
        if (response.status === 'success') {
          console.log('🎫 BookingService: Setting bookings:', response.data);
          this.bookings.set(response.data);
          console.log('🎫 BookingService: Bookings count after set:', this.bookings().length);
        }
      })
    );
  }

  getBookings(): Booking[] {
    return this.bookings();
  }

  clearBookings(): void {
    this.bookings.set([]);
  }
}
