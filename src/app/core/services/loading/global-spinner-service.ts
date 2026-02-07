import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalSpinnerService {
  private _isLoading = signal(true);

  public isLoading = this._isLoading.asReadonly();

  public setIsLoading(isLoading: boolean) {
    this._isLoading.set(isLoading);
  }

  public clearIsLoading() {
    this._isLoading.set(false);
  }
}
