import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '@core/models';
import { MessageService, ToastMessageOptions } from 'primeng/api';

type ToastOptions = Omit<ToastMessageOptions, 'severity'>;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageService = inject(MessageService);

  private readonly defaultConfig: ToastMessageOptions = {
    severity: 'info',
    summary: 'Info',
    detail: 'Info',
    life: 3000,
  };

  public show(options: ToastMessageOptions): void {
    this.messageService.add({ ...this.defaultConfig, ...options });
  }

  public success(message: string, options: ToastOptions = {}): void {
    this.show({ severity: 'success', summary: 'Success', detail: message, ...options });
  }

  public error(message: string, options: ToastOptions = {}): void {
    this.show({ severity: 'error', summary: 'Error', detail: message, ...options });
  }

  public info(message: string, options: ToastOptions = {}): void {
    this.show({ severity: 'info', summary: 'Info', detail: message, ...options });
  }

  public warning(message: string, options: ToastOptions = {}): void {
    this.show({ severity: 'warning', summary: 'Warning', detail: message, ...options });
  }

  public showFromApiResponse(response: ApiResponse<any>, options: ToastOptions = {}): void {
    this.show({
      severity: response.success ? 'success' : 'error',
      summary: response.success ? 'Success' : 'Error',
      detail:
        (response.success && response.message) ||
        (!response.success && response.error?.message) ||
        'An error occurred',
      life: response.success ? 3000 : 8000,
      ...options,
    });
  }
}
