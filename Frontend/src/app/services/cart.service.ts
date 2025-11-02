import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  maxStock?: number;
}

export interface CartSyncResponse {
  success: boolean;
  cart: CartItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_STORAGE_PREFIX = 'cart_user_';
  private readonly MAX_QUANTITY_PER_ITEM = 99;
  private api = `${environment.apiUrl}/cart`;
  private currentUserId: string | null = null;

  private cartItems = signal<CartItem[]>([]);

  cartCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  cartTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.price * item.quantity, 0);
  });

  constructor(
    private httpService: HttpService,
    private storage: StorageService
  ) {
    // Don't load cart on init, wait for user login
    // Register callbacks with AuthService
    const authService = inject(AuthService);
    authService.onLogin((userId) => this.loadCartForUser(userId));
    authService.onLogout(() => this.clearCartOnLogout());
  }

  /**
   * Load cart for specific user
   * Called after user login
   */
  loadCartForUser(userId: string): void {
    this.currentUserId = userId;
    this.loadCartFromStorage();
  }

  /**
   * Clear cart on logout (hide items but don't delete from storage)
   */
  clearCartOnLogout(): void {
    this.cartItems.set([]);
    this.currentUserId = null;
  }

  private getStorageKey(): string {
    return this.currentUserId ? `${this.CART_STORAGE_PREFIX}${this.currentUserId}` : 'cart_guest';
  }

  private loadCartFromStorage(): void {
    if (!this.currentUserId) {
      this.cartItems.set([]);
      return;
    }

    try {
      const storageKey = this.getStorageKey();
      // Try sessionStorage first
      const cartJson = this.storage.getSessionItem<CartItem[]>(storageKey);

      if (!cartJson) {
        // Fallback to cookies
        const cookieCart = this.storage.getCookie<CartItem[]>(storageKey);
        if (cookieCart) {
          this.cartItems.set(cookieCart);
          return;
        }
      }

      if (cartJson) {
        this.cartItems.set(cartJson);
      } else {
        this.cartItems.set([]);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItems.set([]);
    }
  }

  private saveCartToStorage(): void {
    if (!this.currentUserId) {
      return; // Don't save if no user is logged in
    }

    try {
      const storageKey = this.getStorageKey();
      const cartData = this.cartItems();
      // Save to sessionStorage (cleared on tab close)
      this.storage.setSessionItem(storageKey, cartData);
      // Also save to cookies for persistence
      this.storage.setCookie(storageKey, cartData, 30);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems();
  }

  addToCart(product: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.productId === product.productId
    );

    if (existingItemIndex > -1) {
      const existingItem = currentItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      // Check max stock limit
      if (product.maxStock && newQuantity > product.maxStock) {
        console.warn(`Cannot add more. Max stock: ${product.maxStock}`);
        return;
      }

      // Check max quantity limit
      if (newQuantity > this.MAX_QUANTITY_PER_ITEM) {
        console.warn(`Cannot add more. Max quantity per item: ${this.MAX_QUANTITY_PER_ITEM}`);
        return;
      }

      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
      };
      this.cartItems.set(updatedItems);
    } else {
      // Check if quantity exceeds limits
      if (product.maxStock && quantity > product.maxStock) {
        console.warn(`Cannot add. Max stock: ${product.maxStock}`);
        return;
      }

      if (quantity > this.MAX_QUANTITY_PER_ITEM) {
        console.warn(`Cannot add. Max quantity: ${this.MAX_QUANTITY_PER_ITEM}`);
        return;
      }

      this.cartItems.set([...currentItems, { ...product, quantity }]);
    }

    this.saveCartToStorage();
  }

  removeFromCart(productId: string): void {
    const updatedItems = this.cartItems().filter((item) => item.productId !== productId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (quantity > this.MAX_QUANTITY_PER_ITEM) {
      console.warn(`Max quantity is ${this.MAX_QUANTITY_PER_ITEM}`);
      return;
    }

    const currentItems = this.cartItems();
    const itemIndex = currentItems.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      const item = currentItems[itemIndex];

      // Check max stock
      if (item.maxStock && quantity > item.maxStock) {
        console.warn(`Max stock available: ${item.maxStock}`);
        return;
      }

      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity,
      };
      this.cartItems.set(updatedItems);
      this.saveCartToStorage();
    }
  }

  incrementQuantity(productId: string): void {
    const item = this.cartItems().find((item) => item.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrementQuantity(productId: string): void {
    const item = this.cartItems().find((item) => item.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  clearCart(): void {
    this.cartItems.set([]);
    if (this.currentUserId) {
      const storageKey = this.getStorageKey();
      this.storage.removeSessionItem(storageKey);
      this.storage.deleteCookie(storageKey);
    }
  }

  isInCart(productId: string): boolean {
    return this.cartItems().some((item) => item.productId === productId);
  }

  getItemQuantity(productId: string): number {
    const item = this.cartItems().find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  }

  getCartItem(productId: string): CartItem | undefined {
    return this.cartItems().find((item) => item.productId === productId);
  }

  syncCartWithBackend(): Observable<CartSyncResponse> {
    return this.httpService
      .post<CartSyncResponse>(`${this.api}/sync`, {
        items: this.cartItems(),
      })
      .pipe(
        tap((response: CartSyncResponse) => {
          if (response.success && response.cart) {
            this.cartItems.set(response.cart);
            this.saveCartToStorage();
          }
        }),
        catchError((error) => {
          console.error('Error syncing cart with backend:', error);
          return of({ success: false, cart: this.cartItems() });
        })
      );
  }

  loadCartFromBackend(): Observable<CartItem[]> {
    return this.httpService.get<CartItem[]>(`${this.api}`).pipe(
      tap((cart: CartItem[]) => {
        this.cartItems.set(cart);
        this.saveCartToStorage();
      }),
      catchError((error) => {
        console.error('Error loading cart from backend:', error);
        return of([]);
      })
    );
  }

  mergeCartOnLogin(serverCart: CartItem[]): void {
    const localCart = this.cartItems();
    const mergedCart: CartItem[] = [...serverCart];

    localCart.forEach((localItem) => {
      const existingIndex = mergedCart.findIndex((item) => item.productId === localItem.productId);

      if (existingIndex > -1) {
        // Item exists in both, combine quantities
        const combinedQuantity = mergedCart[existingIndex].quantity + localItem.quantity;
        const maxQuantity = Math.min(
          combinedQuantity,
          localItem.maxStock || this.MAX_QUANTITY_PER_ITEM,
          this.MAX_QUANTITY_PER_ITEM
        );
        mergedCart[existingIndex].quantity = maxQuantity;
      } else {
        // Item only in local cart, add it
        mergedCart.push(localItem);
      }
    });

    this.cartItems.set(mergedCart);
    this.saveCartToStorage();
    this.syncCartWithBackend().subscribe();
  }

  validateCart(): Observable<{ valid: boolean; invalidItems: string[] }> {
    return this.httpService
      .post<{ valid: boolean; invalidItems: string[] }>(`${this.api}/validate`, {
        items: this.cartItems(),
      })
      .pipe(
        tap((response: { valid: boolean; invalidItems: string[] }) => {
          if (!response.valid && response.invalidItems.length > 0) {
            // Remove invalid items
            response.invalidItems.forEach((productId: string) => {
              this.removeFromCart(productId);
            });
          }
        }),
        catchError((error) => {
          console.error('Error validating cart:', error);
          return of({ valid: true, invalidItems: [] });
        })
      );
  }
}
