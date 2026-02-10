import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesService {
  private readonly _existsUnsavedChanges = signal(false);
  public readonly existsUnsavedChanges = this._existsUnsavedChanges.asReadonly();

  private readonly messageService = inject(MessageService);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public markUnsavedChanges(): void {
    this._existsUnsavedChanges.set(true);
    this.messageService.add({
      key: 'confirm',
      sticky: true,
      severity: 'success',
      summary: 'Can you send me the report?',
    });
  }

  public markSavedChanges(): void {
    this._existsUnsavedChanges.set(false);
  }
}
