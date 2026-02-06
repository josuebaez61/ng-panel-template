import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Panel } from './panel';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { provideTranslateTestingConfig, provideLanguageOptions } from '@core/providers';
import { provideCurrentLang } from '@core/providers/current-lang-provider';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('Panel', () => {
  let component: Panel;
  let fixture: ComponentFixture<Panel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Panel],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        provideTranslateTestingConfig(),
        provideLanguageOptions(),
        provideCurrentLang(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Panel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
