import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalProgressBarService {
  private _isLoading = signal(false);
  private _activeRequestsCount = signal(0);

  public isLoading = this._isLoading.asReadonly();
  public activeRequestsCount = this._activeRequestsCount.asReadonly();

  public setIsLoading(isLoading: boolean) {
    this._isLoading.set(isLoading);
  }

  public clearIsLoading() {
    this._isLoading.set(false);
  }

  /**
   * Increment the active requests counter
   */
  public incrementActiveRequests(): void {
    this._activeRequestsCount.update((count) => count + 1);
  }

  /**
   * Decrement the active requests counter
   */
  public decrementActiveRequests(): void {
    this._activeRequestsCount.update((count) => Math.max(0, count - 1));
  }

  /**
   * Get the current active requests count
   */
  public getActiveRequestsCount(): number {
    return this._activeRequestsCount();
  }

  /**
   * Reset the active requests counter
   */
  public resetActiveRequests(): void {
    this._activeRequestsCount.set(0);
    this._isLoading.set(false);
  }
}
