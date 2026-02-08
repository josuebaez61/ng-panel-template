import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PanelPageWrapper } from '@shared/components/layout/panel-page-wrapper/panel-page-wrapper';

@Component({
  selector: 'app-home',
  imports: [TranslateModule, PanelPageWrapper],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
