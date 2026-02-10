import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { Topbar } from '../common/topbar/topbar';
import { RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { PanelDrawer } from './panel-drawer/panel-drawer';
import { ResponsiveService } from '../../../core/services/window/responsive-service';
import { PanelDrawerState } from '../../../core/services/panel/panel-drawer-state';
import { NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-panel',
  imports: [Topbar, RouterModule, DrawerModule, PanelDrawer],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Panel implements OnInit, OnDestroy {
  private readonly responsiveService = inject(ResponsiveService);
  private readonly drawerState = inject(PanelDrawerState);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  public isModal = computed(() => !this.responsiveService.isDesktop());

  // Use drawer state from service
  public drawerVisible = this.drawerState.isOpen;

  public ngOnInit(): void {
    // Auto-close drawer on mobile when navigating
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.responsiveService.shouldAutoCloseSidebar()) {
          this.drawerState.close();
        }
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public toggleSidenav(): void {
    this.drawerState.toggle();
  }
}
