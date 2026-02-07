import { TranslateTestingLoader } from '@core/testing/translate-testing-loader';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const provideTranslateConfig = () =>
  provideTranslateService({
    loader: provideTranslateHttpLoader({
      prefix: './i18n/',
      suffix: '.json',
    }),
    fallbackLang: 'en-US',
    useDefaultLang: true,
  });

export const provideTranslateTestingConfig = () =>
  provideTranslateService({
    loader: provideTranslateLoader(TranslateTestingLoader),
    fallbackLang: 'en-US',
  });
