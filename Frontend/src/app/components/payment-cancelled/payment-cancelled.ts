import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-payment-cancelled',
  templateUrl: './payment-cancelled.html',
  styleUrls: ['./payment-cancelled.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
})
export class PaymentCancelled {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
