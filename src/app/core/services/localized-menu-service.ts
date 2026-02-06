import { Injectable, inject } from '@angular/core';
import { CURRENT_LANG_TOKEN } from '@core/providers/current-lang-provider';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalizedMenuService {
  private readonly translateService = inject(TranslateService);
  private readonly currentLang$ = inject(CURRENT_LANG_TOKEN);

  public createMenu(menu: MenuItem[]): Observable<MenuItem[]> {
    return this.currentLang$.pipe(
      map((_lang) => {
        return this.translateLabels(menu);
      })
    );
  }

  private translateLabels(item: MenuItem[]): MenuItem[] {
    return item.map((item) => ({
      ...item,
      label: item.label ? this.translateService.instant(item.label) : undefined,
      items: item.items ? this.translateLabels(item.items) : undefined,
    }));
  }
}
