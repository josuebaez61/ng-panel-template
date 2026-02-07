import { InjectionToken, Provider } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, startWith } from 'rxjs';

export const CURRENT_LANG_TOKEN = new InjectionToken<Observable<string>>('CURRENT_LANG');

export const provideCurrentLang = (): Provider => {
  return {
    provide: CURRENT_LANG_TOKEN,
    useFactory: (translate: TranslateService): Observable<string> => {
      return translate.onLangChange.pipe(
        startWith(translate.getCurrentLang() || translate.getFallbackLang() || ''),
        map((event) => {
          // Handle both string and LangChangeEvent types
          if (typeof event === 'string') {
            return event;
          }
          // Extract lang from LangChangeEvent
          const lang = event?.lang;
          return lang || translate.getCurrentLang() || translate.getFallbackLang() || '';
        })
      );
    },
    deps: [TranslateService],
  };
};
