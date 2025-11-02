import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CartService } from '../../services/cart.service';
import { FavoriteService } from '../../services/favorite.service';
import { NotificationService } from '../../services/notification.service';
import { ReviewFormComponent } from '../review-form/review-form';
import { ReviewListComponent } from '../review-list/review-list';

interface Review {
  text: string;
  rating: number;
  date: string;
}

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, DialogModule, ReviewListComponent, ReviewFormComponent, ToastModule],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.css']
})
export class MovieDetailComponent {
  @Input() title: string = '';
  @Input() overview: string = '';
  @Input() imageUrl: string = '';
  @Input() reviews: Review[] = [];
  @Input() visible: boolean = false;
  @Input() id: string = '';
  @Input() price: number = 19.99;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() reviewAdded = new EventEmitter<Review>();

  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  notificationService = inject(NotificationService);

  onReviewSubmitted(review: Review): void {
    this.reviewAdded.emit(review);
  }

  addToCart(): void {
    this.cartService.addToCart({
      id: this.id,
      productId: this.id,
      name: this.title,
      price: this.price,
      image: this.imageUrl
    });
    this.notificationService.success(`Added "${this.title}" to your cart!`);
  }

  addToFavorites(): void {
    this.favoriteService.addToFavorites({
      id: this.id,
      productId: this.id,
      name: this.title,
      price: this.price,
      image: this.imageUrl
    });
    this.notificationService.success(`Added "${this.title}" to your favorites!`);
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.id);
  }

  isFavorite(): boolean {
    return this.favoriteService.isFavorite(this.id);
  }
}
