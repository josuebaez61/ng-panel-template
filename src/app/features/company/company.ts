import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Organization, UpdateOrganizationRequest } from '@core/models';
import { OrganizationApi } from '@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { PhoneInput } from '@shared/components/inputs/phone-input/phone-input';

@Component({
  selector: 'app-company',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    FormFieldContainer,
    FormFieldError,
    PanelModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    PanelPageHeader,
    PhoneInput,
  ],
  templateUrl: './company.html',
  styleUrl: './company.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Company implements OnInit {
  private readonly organizationService = inject(OrganizationApi);

  public organization = signal<Organization | null>(null);
  public loading = signal(false);
  public saving = signal(false);

  public form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255),
    ]),
    description: new FormControl('', [Validators.maxLength(1000)]),
    logoUrl: new FormControl('', [Validators.maxLength(500)]),
    websiteUrl: new FormControl('', [Validators.maxLength(500)]),
    email: new FormControl('', [Validators.email, Validators.maxLength(255)]),
    phoneNumber: new FormControl('', [Validators.maxLength(20)]),
  });

  public ngOnInit(): void {
    this.loadOrganization();
  }

  public loadOrganization(): void {
    this.loading.set(true);
    this.organizationService.getOrganization().subscribe({
      next: (organization) => {
        this.organization.set(organization);
        this.form.patchValue({
          name: organization.name,
          description: organization.description || '',
          logoUrl: organization.logoUrl || '',
          websiteUrl: organization.websiteUrl || '',
          email: organization.email || '',
          phoneNumber: organization.phoneNumber || '',
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
    const updateData: UpdateOrganizationRequest = {
      name: this.form.value.name || undefined,
      description: this.form.value.description || undefined,
      logoUrl: this.form.value.logoUrl || undefined,
      websiteUrl: this.form.value.websiteUrl || undefined,
      email: this.form.value.email || undefined,
      phoneNumber: this.form.value.phoneNumber || undefined,
    };

    this.organizationService.updateOrganization(updateData).subscribe({
      next: (organization) => {
        this.organization.set(organization);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  public onReset(): void {
    const organization = this.organization();
    if (organization) {
      this.form.patchValue({
        name: organization.name,
        description: organization.description || '',
        logoUrl: organization.logoUrl || '',
        websiteUrl: organization.websiteUrl || '',
        email: organization.email || '',
        phoneNumber: organization.phoneNumber || '',
      });
      this.form.markAsUntouched();
    }
  }
}
