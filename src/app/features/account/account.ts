import { Component, inject, signal, ViewChild } from '@angular/core';
import { SharedModule } from '@shared/modules';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, Confirm, DialogService, UsersApi } from '@core/services';
import { AddressesList } from '@shared/components/lists/addresses-list/addresses-list';
import { Address } from '@core/models/address-models';
import { mergeMap, of, tap } from 'rxjs';
import { AccountInfo } from './components/account-info/account-info';
import { AccountPersonalInfo } from './components/account-personal-info/account-personal-info';

@Component({
  selector: 'app-account',
  imports: [SharedModule, TranslateModule, AddressesList, AccountInfo, AccountPersonalInfo],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  public readonly usersApi = inject(UsersApi);
  private readonly confirm = inject(Confirm);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  public dialogService = inject(DialogService);
  public user = this.authService.currentUser;
  public addresses = signal<Address[]>([]);
  public loadingAddresses = signal<boolean>(false);

  @ViewChild(AccountInfo)
  public accountInfoComponent!: AccountInfo;

  constructor() {
    this.loadUserAddresses();
  }

  public loadUserAddresses(): void {
    this.loadingAddresses.set(true);
    this.usersApi.getCurrentUserAddresses().subscribe({
      next: (addresses) => {
        this.loadingAddresses.set(false);
        this.addresses.set(addresses);
      },
      error: () => {
        this.loadingAddresses.set(false);
      },
    });
  }

  public openAddressFormDialog(address?: Address) {
    this.dialogService
      .openAddressFormDialog(address)
      ?.onClose?.pipe(
        mergeMap((result) =>
          result
            ? address
              ? this.usersApi
                  .updateCurrentUserAddress(address.id, result)
                  .pipe(tap(() => this.loadUserAddresses()))
              : this.usersApi
                  .createCurrentUserAddress(result)
                  .pipe(tap(() => this.loadUserAddresses()))
            : of(null)
        )
      )
      .subscribe();
  }

  public deleteAddress(address: Address) {
    this.confirm.open({
      header: this.translateService.instant('addresses.deleteAddress'),
      message: this.translateService.instant('addresses.deleteAddressMessage'),
      accept: () => {
        this.usersApi.deleteCurrentUserAddress(address.id).subscribe({
          next: () => {
            this.loadUserAddresses();
          },
        });
      },
      reject: () => {
        // Do nothing
      },
    });
  }
}
