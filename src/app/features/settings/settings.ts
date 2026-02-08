import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrganizationSettings, Currency, UpdateOrganizationSettingsRequest } from '@core/models';
import { OrganizationApi, CurrenciesApi } from '@core/services';
import { SharedModule } from '@shared/modules';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { forkJoin } from 'rxjs';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { PanelPageWrapper } from '@shared/components/layout/panel-page-wrapper/panel-page-wrapper';
import { InputColor } from '@shared/components/inputs/input-color/input-color';
import { OrganizationState } from '@core/services/organization/organization-state';

@Component({
  selector: 'app-settings',
  imports: [
    SharedModule,
    ReactiveFormsModule,
    TranslateModule,
    FormFieldContainer,
    FormFieldError,
    PanelModule,
    ButtonModule,
    SelectModule,
    PanelPageHeader,
    PanelPageWrapper,
    InputColor,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings implements OnInit {
  private readonly organizationApi = inject(OrganizationApi);
  private readonly currenciesApi = inject(CurrenciesApi);
  private readonly organizationState = inject(OrganizationState);

  public settings = signal<OrganizationSettings | null>(null);
  public organizationId = this.organizationState.organizationId;
  public currencies = signal<Currency[]>([]);
  public loading = signal(false);
  public saving = signal(false);

  public form = new FormGroup({
    mainCurrencyId: new FormControl<string>('', [Validators.required]),
    themeColor: new FormControl<string>('', [Validators.maxLength(7)]),
  });

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading.set(true);
    forkJoin({
      settings: this.organizationApi.getOrganizationSettings(this.organizationId),
      currencies: this.currenciesApi.getCurrencies(),
    }).subscribe({
      next: ({ settings, currencies }) => {
        this.settings.set(settings);
        this.currencies.set(currencies);
        this.form.patchValue({
          mainCurrencyId: settings.mainCurrencyId,
          themeColor: settings.themeColor || '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const updateData: UpdateOrganizationSettingsRequest = {
      mainCurrencyId: this.form.value.mainCurrencyId || undefined,
      themeColor: this.form.value.themeColor || undefined,
    };

    this.organizationApi.updateOrganizationSettings(this.organizationId, updateData).subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  public onReset(): void {
    const settings = this.settings();
    if (settings) {
      this.form.patchValue({
        mainCurrencyId: settings.mainCurrencyId,
        themeColor: settings.themeColor || '',
      });
      this.form.markAsUntouched();
    }
  }
}
