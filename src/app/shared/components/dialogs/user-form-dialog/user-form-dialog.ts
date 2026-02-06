import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import {
  CreateUserRequest,
  UpdatePersonRequest,
  UpdateUserRequest,
  UserFormDialogData,
} from '@core/models';
import { UsersApi } from '@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserForm } from '@shared/components/templates/user-form/user-form';
import { DialogActions } from '@shared/directives';
import { ButtonModule } from 'primeng/button';
import { FormGroup } from '@angular/forms';
import { PersonForm } from '@shared/components/templates/person-form/person-form';

@Component({
  selector: 'app-user-form-dialog',
  imports: [UserForm, TranslateModule, ButtonModule, DialogActions, PersonForm],
  templateUrl: './user-form-dialog.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormDialog implements AfterViewInit {
  private readonly usersApi = inject(UsersApi);

  public saving = signal(false);

  @ViewChild(UserForm)
  public userFormComponent?: UserForm;

  @ViewChild(PersonForm)
  public personFormComponent?: PersonForm;

  public get personForm(): FormGroup | undefined {
    return this.personFormComponent?.form;
  }
  public get userForm(): FormGroup | undefined {
    return this.userFormComponent?.form;
  }

  private readonly dialogRef = inject(DynamicDialogRef<UserFormDialog>);
  private readonly dialogConfig = inject(DynamicDialogConfig<UserFormDialogData>);

  public ngAfterViewInit(): void {
    if (this.dialogConfig.data) {
      this.userFormComponent?.form?.patchValue(this.dialogConfig.data.user);
      this.personFormComponent?.form?.patchValue(this.dialogConfig.data.user?.person);
    }
  }

  public closeDialog(): void {
    this.dialogRef.close(false);
  }

  public onSubmit(): void {
    if (this.userForm?.invalid || this.personForm?.invalid) {
      this.userForm?.markAllAsTouched();
      this.personForm?.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const editingUser = this.dialogConfig.data.user;

    const payload = {
      ...(this.userForm?.value as UpdateUserRequest),
      person: {
        ...(this.personForm?.value as UpdatePersonRequest),
      },
    };

    if (editingUser) {
      this.usersApi.updateUser(editingUser.id, payload as UpdateUserRequest).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
    } else {
      this.usersApi.createUser(payload as CreateUserRequest).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
    }
  }
}
