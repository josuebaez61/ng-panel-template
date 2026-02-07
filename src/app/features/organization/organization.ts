import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Organization as OrganizationModel,
  UpdateOrganizationRequest,
} from '@core/models/organization-models';
import { OrganizationApi } from '@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileSelectEvent, FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { PhoneInput } from '@shared/components/inputs/phone-input/phone-input';
import { OrganizationState } from '@core/services/organization/organization-state';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-organization',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    FormFieldContainer,
    FormFieldError,
    PanelModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FileUpload,
    ToastModule,
    PanelPageHeader,
    PhoneInput,
  ],
  templateUrl: './organization.html',
  styleUrl: './organization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Organization implements OnInit {
  @ViewChild('fileUpload') public fileUpload!: FileUpload;

  private readonly organizationService = inject(OrganizationApi);
  private readonly organizationState = inject(OrganizationState);
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);
  public organizationId = this.organizationState.organizationId;
  public organization = this.organizationState.organization;
  public loading = signal(false);
  public saving = signal(false);
  private selectedLogoFile: File | null = null;

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

  constructor() {
    // Sync form with organization state changes
    effect(() => {
      const organization = this.organizationState.organization();
      if (organization) {
        this.patchFormWithOrganization(organization);
      }
    });
  }

  public ngOnInit(): void {
    // Load organization data if not already initialized
    if (!this.organizationState.isInitialized()) {
      this.loading.set(true);
      this.organizationState.initialize().subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    } else {
      // If already initialized, patch form with current state
      const organization = this.organizationState.organization();
      if (organization) {
        this.patchFormWithOrganization(organization);
      }
    }
  }

  private patchFormWithOrganization(organization: OrganizationModel): void {
    this.form.patchValue(
      {
        name: organization.name,
        description: organization.description || '',
        logoUrl: organization.logoUrl || '',
        websiteUrl: organization.websiteUrl || '',
        email: organization.email || '',
        phoneNumber: organization.phoneNumber || '',
      },
      { emitEvent: false }
    );
  }

  public onLogoSelect(event: FileSelectEvent): void {
    const file = event.files[0];
    if (!file) {
      return;
    }
    this.selectedLogoFile = file;
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

    console.log('updateData', updateData);
    console.log('selectedLogoFile', this.selectedLogoFile);

    // Send file along with update data if a file was selected
    this.organizationService
      .updateOrganization(this.organizationId, updateData, this.selectedLogoFile || undefined)
      .subscribe({
        next: () => {
          // Clear selected file after successful update
          this.selectedLogoFile = null;
          if (this.fileUpload) {
            this.fileUpload.clear();
          }
          // Refresh organization state - form will auto-update via effect
          this.organizationState.refresh().subscribe();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }

  public onReset(): void {
    const organization = this.organizationState.organization();
    if (organization) {
      this.patchFormWithOrganization(organization);
      this.form.markAsUntouched();
    }
    // Clear selected file and file upload
    this.selectedLogoFile = null;
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }

  public onLogoUpload(event: FileUploadHandlerEvent): void {
    const file = event.files[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.translateService.get('organization.messages.invalidFileType').subscribe((message) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
        });
      });
      this.fileUpload.clear();
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.translateService.get('organization.messages.fileTooLarge').subscribe((message) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
        });
      });
      this.fileUpload.clear();
      return;
    }

    // Store the file to be sent with the form submission
    this.selectedLogoFile = file;

    // Show preview message
    this.translateService.get('organization.messages.logoSelected').subscribe((message) => {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: message || 'Logo seleccionado. Guarda el formulario para aplicar los cambios.',
      });
    });
  }
}
