import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from './theme-service';
import { StorageService } from '../storage/storage-service';
import { THEME_DARK_CSS_CLASS_NAME, THEME_LIGHT_CSS_CLASS_NAME } from '@core/constants';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;
  let storageService: jasmine.SpyObj<StorageService>;
  let mockDocument: Document;
  let htmlElement: HTMLElement;

  beforeEach(() => {
    // Create mock HTML element
    htmlElement = {
      classList: {
        add: jasmine.createSpy('add'),
        remove: jasmine.createSpy('remove'),
        contains: jasmine.createSpy('contains').and.returnValue(false),
      },
    } as unknown as HTMLElement;

    // Create mock document
    mockDocument = {
      querySelector: jasmine.createSpy('querySelector').and.returnValue(htmlElement),
    } as unknown as Document;

    // Create mock StorageService
    storageService = jasmine.createSpyObj('StorageService', ['getTheme', 'setTheme']);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: StorageService, useValue: storageService },
        { provide: DOCUMENT, useValue: mockDocument },
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    // Reset spies after each test
    (htmlElement.classList.add as jasmine.Spy).calls.reset();
    (htmlElement.classList.remove as jasmine.Spy).calls.reset();
    (htmlElement.classList.contains as jasmine.Spy).calls.reset();
    storageService.setTheme.calls.reset();
    storageService.getTheme.calls.reset();
  });

  describe('loadTheme', () => {
    it('should load theme from storage when valid theme exists', () => {
      storageService.getTheme.and.returnValue('dark');
      const applyThemeSpy = spyOn(service, 'applyTheme');

      service.loadTheme();

      expect(storageService.getTheme).toHaveBeenCalled();
      expect(applyThemeSpy).toHaveBeenCalledWith('dark');
    });

    it('should apply light theme when storage returns null', () => {
      storageService.getTheme.and.returnValue(null);
      const applyThemeSpy = spyOn(service, 'applyTheme');

      service.loadTheme();

      expect(storageService.getTheme).toHaveBeenCalled();
      expect(applyThemeSpy).toHaveBeenCalledWith('light');
    });

    it('should apply light theme when storage returns invalid theme', () => {
      storageService.getTheme.and.returnValue('invalid-theme');
      const applyThemeSpy = spyOn(service, 'applyTheme');

      service.loadTheme();

      expect(storageService.getTheme).toHaveBeenCalled();
      expect(applyThemeSpy).toHaveBeenCalledWith('light');
    });

    it('should load theme on service initialization', () => {
      storageService.getTheme.and.returnValue('dark');
      const applyThemeSpy = spyOn(ThemeService.prototype, 'applyTheme').and.callThrough();

      // Create a new service instance which will call loadTheme in constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: StorageService, useValue: storageService },
          { provide: DOCUMENT, useValue: mockDocument },
          provideZonelessChangeDetection(),
        ],
      });

      TestBed.inject(ThemeService);

      expect(applyThemeSpy).toHaveBeenCalled();
    });
  });

  describe('applyTheme', () => {
    it('should apply dark theme correctly', () => {
      service.applyTheme('dark');

      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);
      expect(htmlElement.classList.remove).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);
      expect(storageService.setTheme).toHaveBeenCalledWith('dark');
      expect(service.currentTheme()).toBe('dark');
    });

    it('should apply light theme correctly', () => {
      service.applyTheme('light');

      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);
      expect(htmlElement.classList.remove).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);
      expect(storageService.setTheme).toHaveBeenCalledWith('light');
      expect(service.currentTheme()).toBe('light');
    });

    it('should switch from light to dark theme', () => {
      service.applyTheme('light');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);

      (htmlElement.classList.add as jasmine.Spy).calls.reset();
      (htmlElement.classList.remove as jasmine.Spy).calls.reset();

      service.applyTheme('dark');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);
      expect(htmlElement.classList.remove).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);
    });

    it('should switch from dark to light theme', () => {
      service.applyTheme('dark');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);

      (htmlElement.classList.add as jasmine.Spy).calls.reset();
      (htmlElement.classList.remove as jasmine.Spy).calls.reset();

      service.applyTheme('light');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);
      expect(htmlElement.classList.remove).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);
    });

    it('should not apply invalid theme and log warning', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      const initialTheme = service.currentTheme();
      storageService.setTheme.calls.reset(); // Reset any calls from loadTheme

      // TypeScript will prevent this, but we can test the runtime behavior
      // by casting to any to bypass type checking
      (service as any).applyTheme('invalid');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid theme name: invalid');
      expect(service.currentTheme()).toBe(initialTheme);
      // Note: The service might have called setTheme during loadTheme, so we check
      // that it wasn't called with 'invalid'
      expect(storageService.setTheme).not.toHaveBeenCalledWith('invalid');
    });

    it('should handle null HTML element gracefully', () => {
      (mockDocument.querySelector as jasmine.Spy).and.returnValue(null);
      const consoleLogSpy = spyOn(console, 'log');

      service.applyTheme('dark');

      expect(consoleLogSpy).toHaveBeenCalledWith('Theme applied: dark');
      expect(storageService.setTheme).toHaveBeenCalledWith('dark');
      expect(service.currentTheme()).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.applyTheme('light');
      expect(service.currentTheme()).toBe('light');

      (htmlElement.classList.add as jasmine.Spy).calls.reset();
      (htmlElement.classList.remove as jasmine.Spy).calls.reset();

      service.toggleTheme();

      expect(service.currentTheme()).toBe('dark');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);
    });

    it('should toggle from dark to light', () => {
      service.applyTheme('dark');
      expect(service.currentTheme()).toBe('dark');

      (htmlElement.classList.add as jasmine.Spy).calls.reset();
      (htmlElement.classList.remove as jasmine.Spy).calls.reset();

      service.toggleTheme();

      expect(service.currentTheme()).toBe('light');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);
    });

    it('should call applyTheme when toggling', () => {
      const applyThemeSpy = spyOn(service, 'applyTheme');
      service.applyTheme('light');

      service.toggleTheme();

      expect(applyThemeSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('setLightTheme', () => {
    it('should set light theme', () => {
      service.setLightTheme();

      expect(service.currentTheme()).toBe('light');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_LIGHT_CSS_CLASS_NAME);
      expect(storageService.setTheme).toHaveBeenCalledWith('light');
    });

    it('should call applyTheme with light', () => {
      const applyThemeSpy = spyOn(service, 'applyTheme');

      service.setLightTheme();

      expect(applyThemeSpy).toHaveBeenCalledWith('light');
    });
  });

  describe('setDarkTheme', () => {
    it('should set dark theme', () => {
      service.setDarkTheme();

      expect(service.currentTheme()).toBe('dark');
      expect(htmlElement.classList.add).toHaveBeenCalledWith(THEME_DARK_CSS_CLASS_NAME);
      expect(storageService.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should call applyTheme with dark', () => {
      const applyThemeSpy = spyOn(service, 'applyTheme');

      service.setDarkTheme();

      expect(applyThemeSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('currentTheme computed signal', () => {
    it('should return current theme', () => {
      service.applyTheme('light');
      expect(service.currentTheme()).toBe('light');

      service.applyTheme('dark');
      expect(service.currentTheme()).toBe('dark');
    });

    it('should be reactive to theme changes', () => {
      expect(service.currentTheme()).toBe('light'); // Default after loadTheme

      service.applyTheme('dark');
      expect(service.currentTheme()).toBe('dark');

      service.applyTheme('light');
      expect(service.currentTheme()).toBe('light');
    });
  });

  describe('isDark computed signal', () => {
    it('should return true when theme is dark', () => {
      service.applyTheme('dark');
      expect(service.isDark()).toBe(true);
    });

    it('should return false when theme is light', () => {
      service.applyTheme('light');
      expect(service.isDark()).toBe(false);
    });

    it('should be reactive to theme changes', () => {
      service.applyTheme('light');
      expect(service.isDark()).toBe(false);

      service.applyTheme('dark');
      expect(service.isDark()).toBe(true);

      service.toggleTheme();
      expect(service.isDark()).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should maintain theme state across multiple operations', () => {
      // Start with light
      service.setLightTheme();
      expect(service.currentTheme()).toBe('light');
      expect(service.isDark()).toBe(false);

      // Toggle to dark
      service.toggleTheme();
      expect(service.currentTheme()).toBe('dark');
      expect(service.isDark()).toBe(true);

      // Set explicitly to light
      service.setLightTheme();
      expect(service.currentTheme()).toBe('light');
      expect(service.isDark()).toBe(false);

      // Set explicitly to dark
      service.setDarkTheme();
      expect(service.currentTheme()).toBe('dark');
      expect(service.isDark()).toBe(true);
    });

    it('should persist theme to storage on every change', () => {
      storageService.setTheme.calls.reset();

      service.setLightTheme();
      expect(storageService.setTheme).toHaveBeenCalledWith('light');

      service.toggleTheme();
      expect(storageService.setTheme).toHaveBeenCalledWith('dark');

      service.setDarkTheme();
      expect(storageService.setTheme).toHaveBeenCalledWith('dark');
    });
  });
});
