import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@core/services';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-theme-button',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-button
      (onClick)="onClick()"
      [icon]="themeService.isDark() ? 'pi pi-moon text-yellow-200' : 'pi pi-sun'"
      [rounded]="true"
      text
    />
  `,
  styles: ``,
})
export class ThemeButton {
  public themeService = inject(ThemeService);

  public onClick() {
    this.themeService.toggleTheme();
  }
}
