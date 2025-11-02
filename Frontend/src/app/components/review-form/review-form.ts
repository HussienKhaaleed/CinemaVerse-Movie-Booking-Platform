import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';

interface Review {
  text: string;
  rating: number;
  date: string;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingModule, TextareaModule, ButtonModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css']
})
export class ReviewFormComponent {
  @Output() reviewSubmitted = new EventEmitter<Review>();

  reviewText: string = '';
  userRating: number = 0;

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  submitReview(): void {
    if (!this.reviewText.trim() || this.userRating === 0) return;

    this.reviewSubmitted.emit({
      text: this.reviewText,
      rating: this.userRating,
      date: this.getCurrentDate()
    });

    // Reset form
    this.reviewText = '';
    this.userRating = 0;
  }
}
