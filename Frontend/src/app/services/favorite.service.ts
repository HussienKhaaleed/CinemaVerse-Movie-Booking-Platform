import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';

export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  addedAt: Date;
}

export interface FavoriteSyncResponse {
  success: boolean;
  favorites: FavoriteItem[];
}

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly STORAGE_PREFIX = 'fav_user_';
  private api = `${environment.apiUrl}/favorite`;
  private currentUserId: string | null = null;

  private favoriteItems = signal<FavoriteItem[]>([]);

  // Computed signals
  favoriteCount = computed(() => this.favoriteItems().length);

  favoriteIds = computed(() => this.favoriteItems().map((item) => item.productId));

  constructor(
    private httpService: HttpService,
    private storage: StorageService
  ) {
    // Don't load favorites on init, wait for user login
    // Register callbacks with AuthService
    const authService = inject(AuthService);
    authService.onLogin((userId) => this.loadFavoritesForUser(userId));
    authService.onLogout(() => this.clearFavoritesOnLogout());
  }

  /**
   * Load favorites for specific user
   * Called after user login
   */
  loadFavoritesForUser(userId: string): void {
    this.currentUserId = userId;
    this.loadFavoritesFromStorage();
  }

  /**
   * Clear favorites on logout (hide items but don't delete from storage)
   */
  clearFavoritesOnLogout(): void {
    this.favoriteItems.set([]);
    this.currentUserId = null;
  }

  private getStorageKey(): string {
    return this.currentUserId ? `${this.STORAGE_PREFIX}${this.currentUserId}` : 'fav_guest';
  }

  private loadFavoritesFromStorage(): void {
    if (!this.currentUserId) {
      this.favoriteItems.set([]);
      return;
    }

    try {
      const storageKey = this.getStorageKey();
      // Try sessionStorage first
      const favoritesJson = this.storage.getSessionItem<FavoriteItem[]>(storageKey);

      if (!favoritesJson) {
        // Fallback to cookies
        const cookieFavorites = this.storage.getCookie<FavoriteItem[]>(storageKey);
        if (cookieFavorites) {
          this.favoriteItems.set(this.parseFavorites(cookieFavorites));
          return;
        }
      }

      if (favoritesJson) {
        this.favoriteItems.set(this.parseFavorites(favoritesJson));
      } else {
        this.favoriteItems.set([]);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.favoriteItems.set([]);
    }
  }

  private parseFavorites(favorites: any[]): FavoriteItem[] {
    return favorites.map((item) => ({
      ...item,
      addedAt: new Date(item.addedAt),
    }));
  }

  private saveFavoritesToStorage(): void {
    if (!this.currentUserId) {
      return; // Don't save if no user is logged in
    }

    try {
      const storageKey = this.getStorageKey();
      const favorites = this.favoriteItems();
      // Save to sessionStorage (cleared on tab close)
      this.storage.setSessionItem(storageKey, favorites);
      // Also save to cookies for persistence
      this.storage.setCookie(storageKey, favorites, 30);
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  getFavoriteItems(): FavoriteItem[] {
    return this.favoriteItems();
  }

  addToFavorites(product: Omit<FavoriteItem, 'addedAt'>): void {
    const currentItems = this.favoriteItems();
    const exists = currentItems.some((item) => item.productId === product.productId);

    if (!exists) {
      const newItem: FavoriteItem = {
        ...product,
        addedAt: new Date(),
      };
      this.favoriteItems.set([...currentItems, newItem]);
      this.saveFavoritesToStorage();
    }
  }

  removeFromFavorites(productId: string): void {
    const updatedItems = this.favoriteItems().filter((item) => item.productId !== productId);
    this.favoriteItems.set(updatedItems);
    this.saveFavoritesToStorage();
  }

  toggleFavorite(product: Omit<FavoriteItem, 'addedAt'>): void {
    if (this.isFavorite(product.productId)) {
      this.removeFromFavorites(product.productId);
    } else {
      this.addToFavorites(product);
    }
  }

  addMultipleToFavorites(products: Omit<FavoriteItem, 'addedAt'>[]): void {
    const currentItems = this.favoriteItems();
    const newItems: FavoriteItem[] = products
      .filter((product) => !currentItems.some((item) => item.productId === product.productId))
      .map((product) => ({
        ...product,
        addedAt: new Date(),
      }));

    if (newItems.length > 0) {
      this.favoriteItems.set([...currentItems, ...newItems]);
      this.saveFavoritesToStorage();
    }
  }

  removeMultipleFromFavorites(productIds: string[]): void {
    const updatedItems = this.favoriteItems().filter(
      (item) => !productIds.includes(item.productId)
    );
    this.favoriteItems.set(updatedItems);
    this.saveFavoritesToStorage();
  }

  clearFavorites(): void {
    this.favoriteItems.set([]);
    if (this.currentUserId) {
      const storageKey = this.getStorageKey();
      this.storage.removeSessionItem(storageKey);
      this.storage.deleteCookie(storageKey);
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteItems().some((item) => item.productId === productId);
  }

  getFavoriteItem(productId: string): FavoriteItem | undefined {
    return this.favoriteItems().find((item) => item.productId === productId);
  }

  getFavoritesSorted(order: 'asc' | 'desc' = 'desc'): FavoriteItem[] {
    const items = [...this.favoriteItems()];
    return items.sort((a, b) => {
      const dateA = new Date(a.addedAt).getTime();
      const dateB = new Date(b.addedAt).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  getFavoritesByPriceRange(minPrice: number, maxPrice: number): FavoriteItem[] {
    return this.favoriteItems().filter((item) => item.price >= minPrice && item.price <= maxPrice);
  }

  searchFavorites(query: string): FavoriteItem[] {
    const lowerQuery = query.toLowerCase();
    return this.favoriteItems().filter((item) => item.name.toLowerCase().includes(lowerQuery));
  }

  syncFavoritesWithBackend(): Observable<FavoriteSyncResponse> {
    return this.httpService
      .post<FavoriteSyncResponse>(`${this.api}/sync`, {
        items: this.favoriteItems(),
      })
      .pipe(
        tap((response: FavoriteSyncResponse) => {
          if (response.success && response.favorites) {
            this.favoriteItems.set(this.parseFavorites(response.favorites));
            this.saveFavoritesToStorage();
          }
        }),
        catchError((error) => {
          console.error('Error syncing favorites with backend:', error);
          return of({ success: false, favorites: this.favoriteItems() });
        })
      );
  }

  loadFavoritesFromBackend(): Observable<FavoriteItem[]> {
    return this.httpService.get<FavoriteItem[]>(`${this.api}`).pipe(
      tap((favorites: FavoriteItem[]) => {
        this.favoriteItems.set(this.parseFavorites(favorites));
        this.saveFavoritesToStorage();
      }),
      catchError((error) => {
        console.error('Error loading favorites from backend:', error);
        return of([]);
      })
    );
  }

  mergeFavoritesOnLogin(serverFavorites: FavoriteItem[]): void {
    const localFavorites = this.favoriteItems();
    const mergedMap = new Map<string, FavoriteItem>();

    // Add server favorites first
    serverFavorites.forEach((item) => {
      mergedMap.set(item.productId, item);
    });

    // Add local favorites (keep earlier addedAt date if duplicate)
    localFavorites.forEach((localItem) => {
      const existing = mergedMap.get(localItem.productId);
      if (existing) {
        const localDate = new Date(localItem.addedAt).getTime();
        const existingDate = new Date(existing.addedAt).getTime();
        if (localDate < existingDate) {
          mergedMap.set(localItem.productId, localItem);
        }
      } else {
        mergedMap.set(localItem.productId, localItem);
      }
    });

    const mergedFavorites = Array.from(mergedMap.values());
    this.favoriteItems.set(mergedFavorites);
    this.saveFavoritesToStorage();
    this.syncFavoritesWithBackend().subscribe();
  }

  exportFavorites(): string {
    return JSON.stringify(this.favoriteItems(), null, 2);
  }

  importFavorites(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as FavoriteItem[];
      const validItems = this.parseFavorites(imported);
      this.addMultipleToFavorites(validItems);
      return true;
    } catch (error) {
      console.error('Error importing favorites:', error);
      return false;
    }
  }
}
