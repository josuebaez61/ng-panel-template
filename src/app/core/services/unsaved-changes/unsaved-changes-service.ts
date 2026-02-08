import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesService {
  private readonly _unsavedChanges = signal(false);
  public readonly unsavedChanges = this._unsavedChanges.asReadonly();

  constructor() {}

  public markUnsavedChanges(): void {
    this._unsavedChanges.set(true);
  }

  public markSavedChanges(): void {
    this._unsavedChanges.set(false);
  }
}
