import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ProductLike } from '../../services/movie.service';
import { CartButtonComponent } from '../cart-button/cart-button';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button';

@Component({
  selector: 'app-carousel-item',
  standalone: true,
  imports: [CommonModule, TagModule, FavoriteButtonComponent, CartButtonComponent],
  templateUrl: './carousel-item.html',
  styleUrls: ['./carousel-item.css']
})
export class CarouselItemComponent {
  @Input() product!: ProductLike;
  @Output() productClicked = new EventEmitter<ProductLike>();

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Top Rated':
        return 'success';
      case 'Great':
        return 'info';
      case 'Good':
        return 'warn';
      default:
        return 'warn';
    }
  }
}
