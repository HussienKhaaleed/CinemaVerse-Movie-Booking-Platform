import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './cart-button.html',
  styleUrls: ['./cart-button.css'],
})
export class CartButtonComponent {
  @Input() item: any;
  @Output() itemAdded = new EventEmitter<void>();

  showNotification: boolean = false;

  constructor(private cartService: CartService) {}

  get isInCart(): boolean {
    return this.cartService.isInCart(this.item?.id?.toString() || '');
  }

  toggleCart(): void {
    const wasInCart = this.isInCart;

    if (wasInCart) {
      // Remove from cart
      this.cartService.removeFromCart(this.item.id.toString());
    } else {
      // Add to cart
      // Ensure we have the correct image path, prioritizing posterUrl for movie items
      let imageUrl = '';
      if (this.item.posterUrl) {
        imageUrl = this.item.posterUrl;
      } else if (this.item.image) {
        imageUrl = this.item.image;
      } else if (this.item.poster_path) {
        // For API responses that might use poster_path format
        imageUrl = `https://image.tmdb.org/t/p/w500${this.item.poster_path}`;
      }

      this.cartService.addToCart({
        id: this.item.id.toString(),
        productId: this.item.id.toString(),
        name: this.item.title || this.item.name,
        price: this.item.price || 0,
        maxStock: undefined,
        image: imageUrl,
      });
    }

    // Show notification - use the state before the action for the message
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 2000);

    this.itemAdded.emit();
  }

  // Keep the original method for backward compatibility
  addToCart(): void {
    this.toggleCart();
  }
}
