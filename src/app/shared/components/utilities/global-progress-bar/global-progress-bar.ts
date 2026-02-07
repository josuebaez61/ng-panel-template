import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GlobalProgressBarService } from '@core/services';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-global-progress-bar',
  imports: [ProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if(globalProgressBarService.isLoading()) {
    <div class="global-loading-container h-screen w-screen z-9999 fixed top-0 left-0">
      <p-progressbar mode="indeterminate" [style]="{ height: '6px' }" />
    </div>
    }
  `,
  styles: ``,
})
export class GlobalProgressBar {
  public globalProgressBarService = inject(GlobalProgressBarService);
}
