import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSelector } from './lang-selector';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideLanguageOptions, provideTranslateTestingConfig } from '@core/providers';
import { provideCurrentLang } from '@core/providers/current-lang-provider';

describe('LangSelector', () => {
  let component: LangSelector;
  let fixture: ComponentFixture<LangSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangSelector],
      providers: [
        provideZonelessChangeDetection(),
        provideLanguageOptions(),
        provideTranslateTestingConfig(),
        provideCurrentLang(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LangSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
