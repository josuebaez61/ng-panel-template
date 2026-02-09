import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesService {
  private readonly _unsavedChanges = signal(false);
  public readonly unsavedChanges = this._unsavedChanges.asReadonly();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public markUnsavedChanges(): void {
    this._unsavedChanges.set(true);
  }

  public markSavedChanges(): void {
    this._unsavedChanges.set(false);
  }
}
