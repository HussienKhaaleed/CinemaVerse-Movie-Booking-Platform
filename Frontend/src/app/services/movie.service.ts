import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';

// Backend movie interface based on your moviesModel.js
interface BackendMovie {
  _id: string;
  title: string;
  description: string;
  posterImage: string;
  price: number;
  releaseYear?: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendResponse {
  status: string;
  results?: number;
  data: {
    movies?: BackendMovie[];
    movie?: BackendMovie;
  };
}

export interface Genre {
  id: string;
  name: string;
}

export interface MovieItem {
  id: string;
  title: string;
  overview: string;
  posterUrl: string;
  price: number;
  releaseDate?: string;
  category: string;
  voteAverage?: number;
  genres?: string[];
}

export interface ProductLike {
  id: string;
  name: string;
  image: string;
  overview: string;
  price: number;
  inventoryStatus: string;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly apiUrl = `${environment.apiUrl}/movies`;

  constructor(private httpService: HttpService) {}

  // Carousel data (popular movies)
  getPopularMovies(): Observable<ProductLike[]> {
    return this.httpService.get<BackendResponse>(this.apiUrl).pipe(
      map((res: BackendResponse) =>
        (res.data.movies || [])
          .filter((m: BackendMovie) => m.posterImage)
          .map((m: BackendMovie) => this.toProductLike(m))
      ),
      catchError(error => {
        console.error('Error fetching popular movies:', error);
        return of([]);
      })
    );
  }

  // Fetch all movie genres/categories
  getGenres(): Observable<Genre[]> {
    // Since your backend doesn't have a specific genres endpoint,
    // we'll extract unique categories from movies
    return this.httpService.get<BackendResponse>(this.apiUrl).pipe(
      map((res: BackendResponse) => {
        const movies = res.data.movies || [];
        const uniqueCategories = new Set<string>();

        movies.forEach(movie => {
          if (movie.category) {
            uniqueCategories.add(movie.category);
          }
        });

        return Array.from(uniqueCategories).map(category => ({
          id: category,
          name: this.capitalizeFirstLetter(category)
        }));
      }),
      catchError(error => {
        console.error('Error fetching genres:', error);
        return of([]);
      })
    );
  }

  // Discover movies, optionally filtered by genres/categories
  discoverMovies(options?: { genreIds?: string[]; page?: number }): Observable<MovieItem[]> {
    // This would ideally use query params to filter by category
    // For now, we'll fetch all and filter client-side
    return this.httpService.get<BackendResponse>(this.apiUrl).pipe(
      map((res: BackendResponse) => {
        let movies = res.data.movies || [];

        // Filter by category if specified
        if (options?.genreIds && options.genreIds.length) {
          movies = movies.filter(movie =>
            options.genreIds?.includes(movie.category)
          );
        }

        return movies.map(m => this.toMovieItem(m));
      }),
      catchError(error => {
        console.error('Error discovering movies:', error);
        return of([]);
      })
    );
  }

  // Get a single movie by ID
  getMovie(id: string): Observable<MovieItem | null> {
    return this.httpService.get<BackendResponse>(`${this.apiUrl}/${id}`).pipe(
      map((res: BackendResponse) => {
        if (res.data.movie) {
          return this.toMovieItem(res.data.movie);
        }
        return null;
      }),
      catchError(error => {
        console.error(`Error fetching movie with ID ${id}:`, error);
        return of(null);
      })
    );
  }

  private toProductLike(m: BackendMovie): ProductLike {
    return {
      id: m._id,
      name: m.title,
      overview: m.description,
      image: m.posterImage,
      price: m.price,
      inventoryStatus: this.getCategoryStatus(m.category)
    };
  }

  private toMovieItem(m: BackendMovie): MovieItem {
    return {
      id: m._id,
      title: m.title,
      price: m.price,
      overview: m.description,
      posterUrl: m.posterImage,
      releaseDate: m.releaseYear ? m.releaseYear.toString() : undefined,
      category: m.category,
      genres: [m.category], // Using category as the genre for now
      voteAverage: Math.round(Math.random() * 2 * 10) / 10 + 7 // Random rating between 7.0 and 9.0
    };
  }

  private getCategoryStatus(category: string): string {
    switch (category.toLowerCase()) {
      case 'action': return 'Top Rated';
      case 'comedy': return 'Great';
      case 'drama': return 'Good';
      case 'thriller': return 'Trending';
      default: return 'New';
    }
  }

  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
