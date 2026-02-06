import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ListUser, Option, PermissionName, Person, User } from '@core/models';
import {
  AuthState,
  Confirm,
  DialogService,
  PaginatedResourceLoader,
  RolesApi,
  UsersApi,
} from '@core/services';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { UsersTable } from '@shared/components/lists/table/users-table/users-table';
import { TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '@shared/modules';
import { TranslateService } from '@ngx-translate/core';
import { switchMap, tap, of } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [PanelPageHeader, UsersTable, ButtonModule, MenuModule, SharedModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly usersApi = inject(UsersApi);
  private readonly authState = inject(AuthState);
  private readonly dialogService = inject(DialogService);
  private readonly confirm = inject(Confirm);
  private readonly roleService = inject(RolesApi);

  public roleOptions = signal<Option[]>([]);

  public currentUser = this.authState.currentUser;

  public canAssignRoles = computed(
    () => !!this.currentUser()?.hasPermission(PermissionName.ASSIGN_ROLE)
  );

  public canCreateUsers = computed(
    () => !!this.currentUser()?.hasPermission(PermissionName.WRITE_USER)
  );

  public canUpdateUsers = computed(
    () => !!this.currentUser()?.hasPermission(PermissionName.WRITE_USER)
  );

  public paginatedUsers = new PaginatedResourceLoader<ListUser>({
    fetchData: (request) => this.usersApi.paginatedUsers(request),
  });

  public onRoleChange(event: any): void {
    if (event.value) {
      this.paginatedUsers.applyFilter('roleId', event.value);
    } else {
      this.paginatedUsers.clearFilters();
    }
  }

  public ngOnInit(): void {
    this.roleService.getRoleOptions().subscribe({
      next: (options) => {
        this.roleOptions.set(options);
      },
    });
  }

  public onLazyLoad(event: TableLazyLoadEvent): void {
    this.paginatedUsers.handleTableLazyLoadEvent(event);
  }

  public openUserForm(user?: User): void {
    this.dialogService
      .openUserFormDialog(user)
      ?.onClose.pipe(
        tap(() => {
          if (user && this.isCurrentUser(user)) {
            this.authState.hydrateUserData();
          }
        })
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.paginatedUsers.refresh();
          }
        },
      });
  }

  public openPersonForm(user: User, person?: Person): void {
    this.dialogService
      .openPersonFormDialog(user, person)
      ?.onClose.pipe(
        switchMap((data) =>
          data ? this.usersApi.updatePersonByUserId(user.id, data as Person) : of(null)
        )
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.paginatedUsers.refresh();
            if (user.id === this.currentUser()?.id) {
              this.authState.hydrateUserData();
            }
          }
        },
      });
  }

  public deactivateUser(user: User): void {
    this.confirm.open({
      message: this.translateService.instant('users.form.deactivateUserConfirmation', {
        userName: user.username,
      }),
      accept: () => {
        this.usersApi.deactivateUser(user.id).subscribe({
          next: () => {
            this.paginatedUsers.refresh();
          },
        });
      },
    });
  }

  public activateUser(user: User): void {
    this.confirm.open({
      message: this.translateService.instant('users.form.activateUserConfirmation', {
        userName: user.username,
      }),
      accept: () => {
        this.usersApi.activateUser(user.id).subscribe({
          next: () => {
            this.paginatedUsers.refresh();
          },
        });
      },
    });
  }

  public isCurrentUser(user: User): boolean {
    return this.currentUser()?.id === user.id;
  }

  public regenerateTemporaryPassword(user: User): void {
    this.confirm.open({
      message: this.translateService.instant('users.form.regenerateTemporaryPasswordConfirmation', {
        userName: user.username,
      }),
      accept: () => {
        this.usersApi.regenerateTemporaryPassword(user.id).subscribe();
      },
    });
  }

  public getMenuItems(user: User): MenuItem[] {
    const canUpdate = this.canUpdateUsers();
    const isCurrent = this.isCurrentUser(user);

    const items: MenuItem[] = [
      {
        label: this.translateService.instant('users.form.editUser'),
        icon: 'pi pi-pencil',
        command: () => this.openUserForm(user),
        disabled: !canUpdate,
      },
      {
        label: this.translateService.instant('users.form.regenerateTemporaryPassword'),
        icon: 'pi pi-key',
        command: () => this.regenerateTemporaryPassword(user),
        disabled: !canUpdate,
      },
    ];

    if (user.isActive) {
      items.push({
        label: this.translateService.instant('users.form.deactivateUser'),
        icon: 'pi pi-ban',
        command: () => this.deactivateUser(user),
        disabled: !canUpdate || isCurrent,
      });
    } else {
      items.push({
        label: this.translateService.instant('users.form.activateUser'),
        icon: 'pi pi-check',
        command: () => this.activateUser(user),
        disabled: !canUpdate,
      });
    }

    return items;
  }
}
