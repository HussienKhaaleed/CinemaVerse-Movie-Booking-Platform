import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CartService, CartItem } from '../../services/cart.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
})
export class Checkout {
  cartItems: CartItem[] = [];
  isProcessing = false;
  errorMessage = '';

  constructor(
    private cartService: CartService,
    private bookingService: BookingService,
    private router: Router,
  ) {
    this.cartItems = this.cartService.getCartItems();

    if (!this.cartItems || this.cartItems.length === 0) {
      this.router.navigate(['/']);
    }
  }

  formatPrice(price: number) {
    return price.toFixed(2);
  }

  async pay() {
    if (!this.cartItems || this.cartItems.length === 0) return;

    this.isProcessing = true;
    this.errorMessage = '';

    const showTime = new Date().toISOString();
    const items = this.cartItems.map(item => ({
      movieId: item.productId,
      ticketsCount: item.quantity,
      showTime,
    }));

    this.bookingService.createCheckoutSession(items).subscribe({
      next: (res) => {
        if (res && (res as any).sessionUrl) {
          window.location.href = (res as any).sessionUrl;
        } else {
          this.errorMessage = 'Failed to create checkout session';
          this.isProcessing = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to create checkout session';
        this.isProcessing = false;
      },
    });
  }
}
