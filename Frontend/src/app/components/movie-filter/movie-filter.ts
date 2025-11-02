import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { Genre } from '../../services/movie.service';

@Component({
  selector: 'app-movie-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ChipModule],
  templateUrl: './movie-filter.html',
  styleUrls: ['./movie-filter.css']
})
export class MovieFilterComponent {
  @Input() genres: Genre[] = [];
  @Output() genresChanged = new EventEmitter<string[]>();

  selectedGenres: string[] = [];

  selectGenre(genreId: string): void {
    if (this.selectedGenres.includes(genreId)) {
      this.selectedGenres = this.selectedGenres.filter(id => id !== genreId);
    } else {
      this.selectedGenres = [...this.selectedGenres, genreId];
    }
    this.genresChanged.emit([...this.selectedGenres]);
  }

  clearGenres(): void {
    this.selectedGenres = [];
    this.genresChanged.emit([]);
  }

  isSelected(genreId: string): boolean {
    return this.selectedGenres.includes(genreId);
  }
}
