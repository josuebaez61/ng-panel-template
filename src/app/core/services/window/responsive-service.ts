import { Injectable, signal, computed, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '../../../shared/utils';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  private breakpointObserver = inject(BreakpointObserver);

  // Signals for reactive state management
  private _isMobile = signal<boolean>(false);
  private _isTablet = signal<boolean>(false);
  private _isDesktop = signal<boolean>(false);
  private _screenSize = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  private _breakpointChanged = signal<boolean>(false);

  // Computed signals
  public isMobile = computed(() => this._isMobile());
  public isTablet = computed(() => this._isTablet());
  public isDesktop = computed(() => this._isDesktop());
  public screenSize = computed(() => this._screenSize());
  public breakpointChanged = computed(() => this._breakpointChanged());

  // Combined state
  public state = computed<ResponsiveState>(() => ({
    isMobile: this._isMobile(),
    isTablet: this._isTablet(),
    isDesktop: this._isDesktop(),
    screenSize: this._screenSize(),
  }));

  constructor() {
    this.initializeBreakpoints();
    this.initializeResizeListener();
  }

  private initializeBreakpoints(): void {
    // Create custom breakpoint queries using our enum
    const mobileQuery = `(max-width: ${Breakpoints.Small - 1}px)`;
    const tabletQuery = `(min-width: ${Breakpoints.Small}px) and (max-width: ${Breakpoints.Large - 1
      }px)`;
    const desktopQuery = `(min-width: ${Breakpoints.Large}px)`;

    // Observe all breakpoints and update state accordingly
    this.breakpointObserver
      .observe([mobileQuery, tabletQuery, desktopQuery])
      .subscribe((_result) => {
        const width = window.innerWidth;

        // Determine screen size based on width
        if (width < Breakpoints.Small) {
          this._isMobile.set(true);
          this._isTablet.set(false);
          this._isDesktop.set(false);
          this._screenSize.set('sm');
        } else if (width >= Breakpoints.Small && width < Breakpoints.Large) {
          this._isMobile.set(false);
          this._isTablet.set(true);
          this._isDesktop.set(false);
          this._screenSize.set('md');
        } else if (width >= Breakpoints.Large) {
          this._isMobile.set(false);
          this._isTablet.set(false);
          this._isDesktop.set(true);
          this._screenSize.set(width >= Breakpoints.XLarge ? 'xl' : 'lg');
        }
      });

    // Initial check
    this.updateBreakpointState();
  }

  private updateBreakpointState(): void {
    const width = window.innerWidth;

    if (width < Breakpoints.Small) {
      this._isMobile.set(true);
      this._isTablet.set(false);
      this._isDesktop.set(false);
      this._screenSize.set('sm');
    } else if (width >= Breakpoints.Small && width < Breakpoints.Large) {
      this._isMobile.set(false);
      this._isTablet.set(true);
      this._isDesktop.set(false);
      this._screenSize.set('md');
    } else if (width >= Breakpoints.Large) {
      this._isMobile.set(false);
      this._isTablet.set(false);
      this._isDesktop.set(true);
      this._screenSize.set(width >= Breakpoints.XLarge ? 'xl' : 'lg');
    }
  }

  /**
   * Check if the current screen size is mobile or tablet
   */
  public isMobileOrTablet(): boolean {
    return this._isMobile() || this._isTablet();
  }

  /**
   * Get the current window width
   */
  public getCurrentWidth(): number {
    return window.innerWidth;
  }

  /**
   * Check if the sidebar should auto-close on navigation
   * Only closes on mobile devices
   */
  public shouldAutoCloseSidebar(): boolean {
    return this._isMobile();
  }

  /**
   * Initialize resize listener to detect breakpoint changes
   */
  private initializeResizeListener(): void {
    let previousBreakpoint = this.getCurrentBreakpoint();

    window.addEventListener('resize', () => {
      const currentBreakpoint = this.getCurrentBreakpoint();

      // Check if breakpoint has changed
      if (currentBreakpoint !== previousBreakpoint) {
        this._breakpointChanged.set(true);

        // Reset the signal after a short delay to allow components to react
        setTimeout(() => {
          this._breakpointChanged.set(false);
        }, 100);
      }

      previousBreakpoint = currentBreakpoint;
    });
  }

  /**
   * Get current breakpoint based on window width
   */
  private getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;

    if (width < Breakpoints.Small) {
      return 'mobile';
    } else if (width >= Breakpoints.Small && width < Breakpoints.Large) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Check if the current breakpoint is mobile
   */
  public isCurrentlyMobile(): boolean {
    return this.getCurrentBreakpoint() === 'mobile';
  }
}
