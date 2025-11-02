import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { CartService } from '../../services/cart.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    RouterModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class Navbar {
  showLoginDialog = signal(false);
  showRegisterDialog = signal(false);
  showCartDialog = signal(false);
  showFavoritesDialog = signal(false);
  showBookingsDialog = signal(false);
  mobileMenuOpen = signal(false);
  isLoggingIn = signal(false);
  isRegistering = signal(false);
  isLoadingCart = signal(false);
  isLoadingFavorites = signal(false);
  isLoadingBookings = signal(false);
  loginError = signal('');
  registerError = signal('');
  username = '';
  email = '';
  password = '';
  user = computed(() => this.authService.currentUser());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  cartCount = computed(() => this.cartService.cartCount());
  cartTotal = computed(() => this.cartService.cartTotal());
  favoriteCount = computed(() => this.favoriteService.favoriteCount());
  bookingCount = computed(() => this.bookingService.bookingCount());
  cartItems = computed(() => this.cartService.getCartItems());
  favoriteItems = computed(() => this.favoriteService.getFavoriteItems());
  bookings = computed(() => this.bookingService.getBookings());

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public favoriteService: FavoriteService,
    public bookingService: BookingService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    effect(() => {
      if (this.isAuthenticated()) {
        this.mobileMenuOpen.set(false);
      }
    });
  }

  login() {
    if (!this.email || !this.password) {
      this.loginError.set('Please fill in all fields');
      return;
    }

    // ✅ FRONTEND ADMIN LOGIN (NO BACKEND REQUEST)
    if (this.email === 'admin' && this.password === 'admin') {
      (document.activeElement as HTMLElement)?.blur();
      this.showLoginDialog.set(false);
      this.clearForm();

      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 0); // ✅ Wait for dialog to close before navigating

      this.messageService.add({
        severity: 'success',
        summary: 'Admin Login',
        detail: 'Welcome Admin!',
        life: 3000,
      });
      return;
    }

    // ✅ Normal user login continues here
    this.isLoggingIn.set(true);
    this.loginError.set('');
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.showLoginDialog.set(false);
        this.clearForm();
        this.isLoggingIn.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome back!',
          life: 3000,
        });
        // Cart, favorites, and bookings will load automatically via callbacks
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loginError.set(err.error?.message || 'Login failed. Please try again.');
        this.isLoggingIn.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err.error?.message || 'Please check your credentials',
          life: 4000,
        });
      },
    });
  }

  loadUserBookings() {
    console.log('📞 loadUserBookings called');
    this.isLoadingBookings.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (response) => {
        console.log('✅ Bookings loaded successfully:', response);
        this.isLoadingBookings.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading bookings:', err);
        this.isLoadingBookings.set(false);
      }
    });
  }

  register() {
    if (!this.username || !this.email || !this.password) {
      this.registerError.set('Please fill in all fields');
      return;
    }
    if (this.password.length < 6) {
      this.registerError.set('Password must be at least 6 characters');
      return;
    }
    this.isRegistering.set(true);
    this.registerError.set('');
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.showRegisterDialog.set(false);
        this.clearForm();
        this.isRegistering.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Registration Successful',
          detail: 'Your account has been created!',
          life: 3000,
        });
      },
      error: (err) => {
        console.error('Register failed:', err);
        this.registerError.set(err.error?.message || 'Registration failed. Please try again.');
        this.isRegistering.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Registration Failed',
          detail: err.error?.message || 'Please try again',
          life: 4000,
        });
      },
    });
  }

  openCart() {
    this.showCartDialog.set(true);
  }

  closeCart() {
    this.showCartDialog.set(false);
  }

  openFavorites() {
    this.showFavoritesDialog.set(true);
  }

  closeFavorites() {
    this.showFavoritesDialog.set(false);
  }

  openBookings() {
    console.log('🔍 Opening bookings dialog...');
    console.log('🔍 Current bookings count:', this.bookingCount());
    console.log('🔍 Current bookings:', this.bookings());

    this.showBookingsDialog.set(true);

    // Force reload bookings when opening dialog
    if (this.isAuthenticated()) {
      console.log('🔍 User is authenticated, force loading bookings...');
      this.loadUserBookings();
    } else {
      console.log('❌ User is NOT authenticated');
    }
  }

  closeBookings() {
    this.showBookingsDialog.set(false);
  }

  incrementCartItem(productId: string) {
    this.cartService.incrementQuantity(productId);
  }

  decrementCartItem(productId: string) {
    this.cartService.decrementQuantity(productId);
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
    this.messageService.add({
      severity: 'info',
      summary: 'Item Removed',
      detail: 'Item removed from cart',
      life: 2000,
    });
  }

  removeFromFavorites(productId: string) {
    this.favoriteService.removeFromFavorites(productId);
    this.messageService.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Item removed from favorites',
      life: 2000,
    });
  }

  addFavoriteToCart(item: any) {
    this.cartService.addToCart({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${item.name} added to cart`,
      life: 2000,
    });
  }

  goToCheckout() {
    this.showCartDialog.set(false);
    this.router.navigate(['/checkout']);
  }

  clearCart() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear your cart?',
      header: 'Clear Cart',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.cartService.clearCart();
        this.messageService.add({
          severity: 'success',
          summary: 'Cart Cleared',
          detail: 'All items removed from cart',
          life: 2000,
        });
      },
    });
  }

  clearFavorites() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear all favorites?',
      header: 'Clear Favorites',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.favoriteService.clearFavorites();
        this.messageService.add({
          severity: 'success',
          summary: 'Favorites Cleared',
          detail: 'All favorites removed',
          life: 2000,
        });
      },
    });
  }

  logout() {
    this.authService.logout();
    this.mobileMenuOpen.set(false);
    this.messageService.add({
      severity: 'info',
      summary: 'Logged Out',
      detail: 'You have been logged out successfully',
      life: 2000,
    });
  }

  clearForm() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.loginError.set('');
    this.registerError.set('');
  }

  renderGoogleLogin(type: 'login' | 'register') {
    setTimeout(() => {
      const containerId = type === 'login' ? 'google-login-button' : 'google-register-button';
      const container = document.getElementById(containerId);
      if (!container || !(window as any).google) return;
      container.innerHTML = '';
      (window as any).google.accounts.id.initialize({
        client_id: '435599770187-ev5gsvsfq1u560msf7upaonval162erj.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleSuccess(response, type),
      });
      (window as any).google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: type === 'login' ? 'signin_with' : 'signup_with',
      });
    }, 100);
  }

  handleGoogleSuccess(response: any, type: 'login' | 'register') {
    this.authService.handleGoogleToken(response);
    if (type === 'login') {
      this.showLoginDialog.set(false);
    } else {
      this.showRegisterDialog.set(false);
    }
    this.clearForm();
    this.messageService.add({
      severity: 'success',
      summary: type === 'login' ? 'Login Successful' : 'Registration Successful',
      detail: 'Welcome!',
      life: 3000,
    });
    // Cart, favorites, and bookings will load automatically via callbacks
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
