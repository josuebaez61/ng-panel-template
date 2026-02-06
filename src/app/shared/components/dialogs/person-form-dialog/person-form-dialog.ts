import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { Person, User } from '@core/models';
import { UsersApi } from '@core/services';
import { PersonForm } from '@shared/components/templates/person-form/person-form';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogActions } from '@shared/directives';

export interface PersonFormDialogData {
  user?: User;
  person?: Person;
}

@Component({
  selector: 'app-person-form-dialog',
  imports: [PersonForm, TranslateModule, ButtonModule, DialogActions],
  templateUrl: './person-form-dialog.html',
  styleUrl: './person-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonFormDialog {
  private readonly dialogRef = inject(DynamicDialogRef<PersonFormDialog>);
  private readonly dialogConfig = inject(DynamicDialogConfig<PersonFormDialogData>);
  private readonly usersApi = inject(UsersApi);

  @ViewChild(PersonForm, { static: false })
  public personFormComponent?: PersonForm;

  public saving = signal(false);

  public person = computed(() => this.dialogConfig.data?.person || null);

  public closeDialog(): void {
    this.dialogRef.close(false);
  }

  public onSubmit(): void {
    const form = this.personFormComponent?.form;
    if (form?.invalid) {
      form?.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const editingUser = this.dialogConfig.data?.user;
    if (!editingUser) {
      this.saving.set(false);
      return;
    }

    this.dialogRef.close(form?.value);
  }
}
