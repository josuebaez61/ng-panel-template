import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GlobalLoadingService } from '@core/services';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-global-loading',
  imports: [ProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if(globalLoadingService.isLoading()) {
    <div class="global-loading-container h-screen w-screen z-9999 fixed top-0 left-0">
      <p-progressbar mode="indeterminate" [style]="{ height: '6px' }" />
    </div>
    }
  `,
  styles: ``,
})
export class GlobalLoading {
  public globalLoadingService = inject(GlobalLoadingService);
}
