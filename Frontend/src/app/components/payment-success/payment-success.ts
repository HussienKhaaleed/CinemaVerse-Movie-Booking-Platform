import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, CardModule],
})
export class PaymentSuccess implements OnInit {
  countdown = 5;
  intervalId: any;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {
    this.cartService.clearCart();
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        clearInterval(this.intervalId);
        this.router.navigate(['/']);
      }
    }, 1000);
  }
}
