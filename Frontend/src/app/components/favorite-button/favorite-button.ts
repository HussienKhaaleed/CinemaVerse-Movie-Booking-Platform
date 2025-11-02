import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './favorite-button.html',
  styleUrls: ['./favorite-button.css']
})
export class FavoriteButtonComponent {
  @Input() itemId: string = '';
  @Input() item: any;
  @Output() favoriteChanged = new EventEmitter<boolean>();

  showNotification: boolean = false;

  constructor(private favoriteService: FavoriteService) {}

  get isFavorite(): boolean {
    return this.favoriteService.isFavorite(this.itemId);
  }

  toggleFavorite(): void {
    const wasFavorite = this.isFavorite;

    if (wasFavorite) {
      this.favoriteService.removeFromFavorites(this.itemId);
      this.favoriteChanged.emit(false);
    } else {
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

      this.favoriteService.addToFavorites({
        id: this.itemId,
        productId: this.itemId,
        name: this.item.title || this.item.name,
        price: this.item.price || 0,
        image: imageUrl,
      });
      this.favoriteChanged.emit(true);
    }

    // Show notification - use the state before the action for the message
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 2000);
  }
}
