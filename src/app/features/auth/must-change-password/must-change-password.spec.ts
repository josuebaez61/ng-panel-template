import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MustChangePassword } from './must-change-password';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideTranslateTestingConfig, provideLanguageOptions } from '@core/providers';
import { provideCurrentLang } from '@core/providers/current-lang-provider';

describe('MustChangePassword', () => {
  let component: MustChangePassword;
  let fixture: ComponentFixture<MustChangePassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MustChangePassword],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService,
        provideTranslateTestingConfig(),
        provideLanguageOptions(),
        provideCurrentLang(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MustChangePassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
