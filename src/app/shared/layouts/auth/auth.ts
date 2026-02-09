import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Card } from 'primeng/card';
import { Topbar } from '../common/topbar/topbar';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, FormsModule, CheckboxModule, Card, Topbar, TranslateModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  public appName = environment.appName;
  public title = input<string | null>(null);
  public backRoute = input<string | null>(null);
  public showSidenavToggleButton = input<boolean>(false);
}
