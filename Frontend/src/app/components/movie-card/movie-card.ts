import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { MovieItem } from '../../services/movie.service';
import { CartButtonComponent } from '../cart-button/cart-button';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, CardModule, FavoriteButtonComponent, CartButtonComponent],
  templateUrl: './movie-card.html',
  styleUrls: ['./movie-card.css']
})
export class MovieCardComponent {
  @Input() movie!: MovieItem;
  @Output() movieClicked = new EventEmitter<MovieItem>();

  /**
   * Returns the first two genres of the movie for display
   */
  getFirstTwoGenres(): string[] {
    if (!this.movie.genres || !Array.isArray(this.movie.genres)) {
      return [];
    }
    return this.movie.genres.slice(0, 2);
  }
}
