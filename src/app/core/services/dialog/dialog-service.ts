import { inject, Injectable, Type, Injector, ApplicationRef, DOCUMENT } from '@angular/core';
import { ApiKey, Role, UsersSelectionDialogData, User, Person } from '@core/models';
import { Address } from '@core/models/address-models';
import { TranslateService } from '@ngx-translate/core';
import { AddressFormDialog } from '@shared/components/dialogs/address-form-dialog/address-form-dialog';
import { ApiKeyFormDialog } from '@shared/components/dialogs/api-key-form-dialog/api-key-form-dialog';
import { ChangeEmailDialog } from '@shared/components/dialogs/change-email-dialog/change-email-dialog';
import { ChangePasswordDialog } from '@shared/components/dialogs/change-password-dialog/change-password-dialog';
import { PersonFormDialog } from '@shared/components/dialogs/person-form-dialog/person-form-dialog';
import { RoleFormDialog } from '@shared/components/dialogs/role-form-dialog/role-form-dialog';
import { UserFormDialog } from '@shared/components/dialogs/user-form-dialog/user-form-dialog';
import { UserSelectionDialog } from '@shared/components/dialogs/user-selection-dialog/user-selection-dialog';
import {
  DynamicDialogConfig,
  DynamicDialogRef,
  DialogService as PrimeDialogService,
} from 'primeng/dynamicdialog';

/**
 * Custom DialogService that encapsulates PrimeNG's DialogService.
 * This prevents direct injection of PrimeNG's DialogService in other components,
 * ensuring all dialogs are opened through this centralized service.
 *
 * Note: PrimeNG's DialogService is not provided globally in app.config.ts.
 * It's only instantiated here to maintain encapsulation and centralized dialog management.
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly translateService = inject(TranslateService);
  private readonly injector = inject(Injector);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  // Create a private instance of PrimeNG's DialogService
  // This instance is only accessible within this service
  // PrimeNG DialogService constructor: (applicationRef, injector, document)
  private readonly _dialog = new PrimeDialogService(
    this.applicationRef,
    this.injector,
    this.document
  );

  private readonly defaultConfig: DynamicDialogConfig = {
    width: '40rem',
    height: 'auto',
    header: '',
    footer: '',
    modal: true,
    closable: true,
  };

  private open<T>(component: Type<T>, config: DynamicDialogConfig): DynamicDialogRef<T> | null {
    return this._dialog.open(component, {
      ...this.defaultConfig,
      ...config,
    });
  }

  public openUserFormDialog(user?: User): DynamicDialogRef<UserFormDialog> | null {
    return this.open(UserFormDialog, {
      header: user
        ? this.translateService.instant('users.form.editUser')
        : this.translateService.instant('users.form.addUser'),
      data: {
        user,
      },
      width: '30rem',
    });
  }

  public openRoleFormDialog(role?: Role): DynamicDialogRef<RoleFormDialog> | null {
    return this.open(RoleFormDialog, {
      header: role
        ? this.translateService.instant('roles.form.editRole')
        : this.translateService.instant('roles.form.addRole'),
      data: {
        role,
      },
    });
  }

  public openUsersSelectionDialog(
    data: UsersSelectionDialogData
  ): DynamicDialogRef<UserSelectionDialog> | null {
    return this.open<UserSelectionDialog>(UserSelectionDialog, {
      header: this.translateService.instant('users.userSelection.title'),
      data,
      width: '25rem',
    });
  }

  public openChangePasswordDialog(): DynamicDialogRef<ChangePasswordDialog> | null {
    return this.open(ChangePasswordDialog, {
      header: this.translateService.instant('auth.changePassword.title'),
      width: '30rem',
    });
  }

  public openChangeEmailDialog(): DynamicDialogRef<ChangeEmailDialog> | null {
    return this.open(ChangeEmailDialog, {
      header: this.translateService.instant('auth.changeEmail.title'),
      width: '30rem',
    });
  }

  public openPersonFormDialog(
    user: User,
    person?: Person
  ): DynamicDialogRef<PersonFormDialog> | null {
    return this.open(PersonFormDialog, {
      header: person
        ? this.translateService.instant('people.form.editPerson')
        : this.translateService.instant('people.form.addPerson'),
      data: {
        person,
        user,
      },
      styleClass: 'person-form-dialog',
    });
  }

  public openAddressFormDialog(address?: Address): DynamicDialogRef<AddressFormDialog> | null {
    return this.open(AddressFormDialog, {
      header: address
        ? this.translateService.instant('addresses.editAddress')
        : this.translateService.instant('addresses.addAddress'),
      data: {
        address,
      },
    });
  }

  public openApiKeyFormDialog(apiKey?: ApiKey): DynamicDialogRef<ApiKeyFormDialog> | null {
    return this.open(ApiKeyFormDialog, {
      header: apiKey
        ? this.translateService.instant('apiKeys.form.editApiKey')
        : this.translateService.instant('apiKeys.form.addApiKey'),
      data: {
        apiKey,
      },
    });
  }
}
