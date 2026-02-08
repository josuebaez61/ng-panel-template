import { DOCUMENT, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { UnsavedChangesService } from '@core/services';

export const unsavedChangesGuard: CanDeactivateFn<unknown> = () => {
  const document = inject(DOCUMENT);
  const unsavedChangesService = inject(UnsavedChangesService);
  const toast = document.querySelector('.unsaved-changes-dialog');
  if (unsavedChangesService.unsavedChanges() && toast) {
    toast.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => {
      toast.classList.remove('animate__animated', 'animate__shakeX');
    }, 1000);
  }
  return !unsavedChangesService.unsavedChanges() || !toast;
};
