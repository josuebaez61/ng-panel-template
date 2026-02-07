import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GlobalSpinnerService } from '@core/services';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-global-spinner',
  imports: [ProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if(globalSpinnerService.isLoading()) {
    <div class="global-spinner-overlay">
      <div class="global-spinner-content">
        <p-progressSpinner
          [style]="{ width: '50px', height: '50px' }"
          strokeWidth="4"
          animationDuration="1s"
        />
      </div>
    </div>
    }
  `,
  styles: [
    `
      .global-spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      .global-spinner-content {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class GlobalSpinner {
  public globalSpinnerService = inject(GlobalSpinnerService);
}
