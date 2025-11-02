import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { Genre, MovieItem, MovieService } from '../../services/movie.service';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: number;
  description: string;
  sparkline?: number[];
}

interface RecentActivity {
  type: 'review' | 'watch' | 'rating' | 'favorite';
  user: string;
  movieTitle: string;
  timestamp: Date;
  action: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    ChartModule,
    TimelineModule,
    AvatarModule,
    ProgressBarModule
  ]
})
export class DashboardComponent implements OnInit {
  // Movie Data
  trendingMovies: MovieItem[] = [];
  topRatedMovies: MovieItem[] = [];
  nowPlayingMovies: MovieItem[] = [];
  genres: Genre[] = [];

  // Loading States
  loading = {
    trending: false,
    topRated: false,
    nowPlaying: false
  };

  // Statistics
  stats: StatCard[] = [];
  totalMovies = 0;
  averageRating = 0;

  // Mock data for static UI
  mockStats = [
    { period: 'Today', movies: 15, revenue: '$2,415', views: '1.2K' },
    { period: 'This Week', movies: 89, revenue: '$12,845', views: '8.7K' },
    { period: 'This Month', movies: 342, revenue: '$48,231', views: '34.2K' }
  ];

  genreStats = [
    { name: 'Action', count: 45, color: '#ef4444' },
    { name: 'Drama', count: 38, color: '#3b82f6' },
    { name: 'Comedy', count: 32, color: '#f59e0b' },
    { name: 'Horror', count: 28, color: '#8b5cf6' },
    { name: 'Sci-Fi', count: 25, color: '#10b981' }
  ];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.initializeStaticStats();
  }

  loadInitialData(): void {
    this.loadTrendingMovies();
    this.loadTopRatedMovies();
    this.loadNowPlayingMovies();
    this.loadGenres();
  }

  loadTrendingMovies(): void {
    this.loading.trending = true;
    this.movieService.discoverMovies({ page: 1 }).subscribe({
      next: (movies) => {
        this.trendingMovies = movies.slice(0, 6);
        this.loading.trending = false;
      },
      error: (err) => {
        console.error('Failed to load trending movies', err);
        this.loading.trending = false;
      }
    });
  }

  loadTopRatedMovies(): void {
    this.loading.topRated = true;
    this.movieService.discoverMovies({ page: 2 }).subscribe({
      next: (movies) => {
        this.topRatedMovies = movies
          .sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))
          .slice(0, 6);
        this.loading.topRated = false;

        // Generate upcoming releases based on these movies
        this.generateUpcomingReleases();
      },
      error: (err) => {
        console.error('Failed to load top rated movies', err);
        this.loading.topRated = false;

        // Generate default upcoming releases
        this.generateUpcomingReleases();
      }
    });
  }

  loadNowPlayingMovies(): void {
    this.loading.nowPlaying = true;
    this.movieService.discoverMovies({ page: 3 }).subscribe({
      next: (movies) => {
        this.nowPlayingMovies = movies.slice(0, 6);
        this.loading.nowPlaying = false;
      },
      error: (err) => {
        console.error('Failed to load now playing movies', err);
        this.loading.nowPlaying = false;
      }
    });
  }

  loadGenres(): void {
    this.movieService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
      },
      error: (err) => {
        console.error('Failed to load genres', err);
      }
    });
  }

  initializeStaticStats(): void {
    this.stats = [
      {
        title: 'Total Movies',
        value: '1,234',
        icon: 'pi pi-video',
        color: 'bg-indigo-500/50',
        trend: 12,
        description: 'Across all categories'
      },
      {
        title: 'Avg. Rating',
        value: '8.2',
        icon: 'pi pi-star',
        color: 'bg-emerald-500/50',
        trend: 2.5,
        description: 'User satisfaction score'
      },
      {
        title: 'Active Users',
        value: '45.6K',
        icon: 'pi pi-users',
        color: 'bg-purple-500/50',
        trend: 8,
        description: 'Monthly active viewers'
      },
      {
        title: 'Revenue',
        value: '$124.5K',
        icon: 'pi pi-dollar',
        color: 'bg-amber-500/50',
        trend: 15,
        description: 'This quarter'
      }
    ];
  }

  getVoteColor(voteAverage: number | undefined): string {
    if (!voteAverage) return '#3b82f6'; // Default to blue if undefined
    if (voteAverage >= 8) return '#22c55e'; // Green
    if (voteAverage >= 7) return '#3b82f6'; // Blue
    if (voteAverage >= 6) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  }

  getTrendIcon(trend: number | undefined): string {
    if (!trend) return 'pi pi-minus';
    return trend > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
  }

  getTrendColor(trend: number | undefined): string {
    if (!trend) return 'text-500';
    return trend > 0 ? 'text-green-500' : 'text-red-500';
  }

  // Mock data for user activity
  recentActivities: RecentActivity[] = [
    {
      type: 'review',
      user: 'John Doe',
      movieTitle: 'Inception',
      timestamp: new Date(2025, 9, 21, 14, 30),
      action: 'wrote a review',
      icon: 'pi pi-comment',
      color: 'text-blue-500'
    },
    {
      type: 'watch',
      user: 'Alice Smith',
      movieTitle: 'The Dark Knight',
      timestamp: new Date(2025, 9, 21, 13, 15),
      action: 'watched',
      icon: 'pi pi-eye',
      color: 'text-green-500'
    },
    {
      type: 'rating',
      user: 'Bob Wilson',
      movieTitle: 'Pulp Fiction',
      timestamp: new Date(2025, 9, 21, 12, 45),
      action: 'rated 5 stars',
      icon: 'pi pi-star-fill',
      color: 'text-yellow-500'
    },
    {
      type: 'favorite',
      user: 'Emma Brown',
      movieTitle: 'The Godfather',
      timestamp: new Date(2025, 9, 21, 11, 20),
      action: 'added to favorites',
      icon: 'pi pi-heart-fill',
      color: 'text-red-500'
    }
  ];

  // Mock data for upcoming releases with interfaces
  upcomingReleases: {
    title: string;
    date: string;
    anticipation: number;
  }[] = [];

  // This will be populated from movie data
  generateUpcomingReleases(): void {
    // Start with some default titles in case API doesn't return enough
    const defaultReleases = [
      { title: 'Avatar 3', date: '2025-12-20', anticipation: 95 },
      { title: 'Mission: Impossible 8', date: '2025-11-15', anticipation: 88 },
      { title: 'Black Panther 3', date: '2025-12-01', anticipation: 92 },
      { title: 'John Wick 5', date: '2025-11-30', anticipation: 90 }
    ];

    // Generate from real movies when available
    if (this.topRatedMovies.length > 0) {
      this.upcomingReleases = this.topRatedMovies.slice(0, 4).map(movie => {
        // Generate a random future date
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + Math.floor(Math.random() * 6) + 1);

        return {
          title: movie.title,
          date: futureDate.toISOString().split('T')[0],
          anticipation: Math.floor(Math.random() * 20) + 80 // Random between 80-99
        };
      });
    } else {
      this.upcomingReleases = defaultReleases;
    }
  };

  // Mock user engagement data
  userEngagement = {
    reviews: { count: 1234, trend: 15 },
    watchlist: { count: 567, trend: 8 },
    ratings: { count: 4321, trend: 12 },
    comments: { count: 890, trend: -3 }
  };

  getProgressWidth(count: number): string {
    const maxCount = Math.max(...this.genreStats.map(g => g.count));
    return `${(count / maxCount) * 100}%`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  getAnticipationColor(level: number): string {
    if (level >= 90) return 'text-red-500';
    if (level >= 80) return 'text-orange-500';
    return 'text-yellow-500';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
