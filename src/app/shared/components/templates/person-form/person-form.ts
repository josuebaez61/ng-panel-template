import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Person } from '@core/models';
import { UsersApi } from '@core/services';
import { PhoneInput } from '@shared/components/inputs/phone-input/phone-input';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    PhoneInput,
    InputTextModule,
    SelectModule,
    FormFieldContainer,
    FormFieldError
],
  templateUrl: './person-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonForm implements OnInit {
  // Input signal to initialize the form with person data
  public person = input<Person | null>(null);

  public inlineEditable = input<boolean>(false);

  // Optional UserService input - passed from parent to avoid injection issues in DynamicDialog
  // public usersApi = input<UserService | undefined>(undefined);

  public usersApi = inject(UsersApi);

  // Public form group that parent components can access
  public form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    identificationNumber: new FormControl<string | null>(null, [Validators.maxLength(50)]),
    identificationType: new FormControl<string | null>(null, []),
    phone: new FormControl('', [Validators.maxLength(20)]),
  });

  public identificationTypes = signal<string[]>([]);

  public save = output<{ key: string; value: unknown }>();

  // public onSave(key: string, event: unknown): void {
  //   this.save.emit({ key, value: event });
  // }

  public ngOnInit(): void {
    // Load identification types only if service is provided
    const service = this.usersApi;
    if (service) {
      service.findAllIdentificationTypes().subscribe({
        next: (response) => {
          this.identificationTypes.set(response.data ?? []);
          // Patch form after identification types are loaded
          const personData = this.person();
          if (personData) {
            this.patchForm(personData);
          }
        },
      });
    }
  }

  private patchForm(personData: Person): void {
    this.form.patchValue({
      firstName: personData.firstName || '',
      lastName: personData.lastName || '',
      identificationNumber: personData.identificationNumber,
      identificationType: personData.identificationType,
      phone: personData.phone || '',
    });
  }
}
