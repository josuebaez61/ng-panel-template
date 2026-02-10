import { Injectable, signal, effect, inject } from '@angular/core';
import { ResponsiveService } from '../window/responsive-service';

@Injectable({
  providedIn: 'root',
})
export class PanelDrawerState {
  private readonly responsiveService = inject(ResponsiveService);
  private readonly _isOpen = signal<boolean>(false);
  public readonly isOpen = this._isOpen.asReadonly();

  constructor() {
    // Initialize drawer state based on screen size
    this.updateInitialState();

    // Auto-close drawer on mobile when breakpoint changes to non-desktop
    effect(() => {
      // Track breakpoint changes
      const breakpointChanged = this.responsiveService.breakpointChanged();
      const isDesktop = this.responsiveService.isDesktop();
      
      // When breakpoint changes and we're not on desktop, close the drawer
      if (breakpointChanged && !isDesktop) {
        this.close();
      }
    });
  }

  public open(): void {
    this._isOpen.set(true);
  }

  public close(): void {
    this._isOpen.set(false);
  }

  public toggle(): void {
    this._isOpen.set(!this._isOpen());
  }

  private updateInitialState(): void {
    // On desktop, start with drawer open
    // On mobile/tablet, start with drawer closed
    const isDesktop = this.responsiveService.isDesktop();
    this._isOpen.set(isDesktop);
  }
}
