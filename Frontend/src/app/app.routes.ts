import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { Home } from './components/home/home';
import { Checkout } from './components/checkout/checkout';
import { PaymentSuccess } from './components/payment-success/payment-success';
import { PaymentCancelled } from './components/payment-cancelled/payment-cancelled';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin', component: DashboardComponent },
  { path: 'checkout', component: Checkout },
  { path: 'payment-success', component: PaymentSuccess },
  { path: 'payment-cancel', component: PaymentCancelled },
];
