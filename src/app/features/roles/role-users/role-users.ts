import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Confirm,
  DialogService,
  PaginatedResourceLoader,
  RolesApi,
  UsersApi,
} from '@core/services';
import { SharedModule } from '@shared/modules';
import { FilterMatchMode } from 'primeng/api';
import { UsersTable } from '@shared/components/lists/table/users-table/users-table';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { ListUser, Role, UserOption } from '@core/models';
import { RoutePath } from '@core/constants';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-role-users',
  imports: [SharedModule, UsersTable, PanelPageHeader, ConfirmDialogModule],
  templateUrl: './role-users.html',
  styleUrl: './role-users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleUsers implements OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly confirm = inject(Confirm);
  private readonly translateService = inject(TranslateService);
  private readonly usersApi = inject(UsersApi);
  private readonly roleService = inject(RolesApi);
  private readonly route = inject(ActivatedRoute);
  public role = signal<Role | null>(null);

  public backRoute = RoutePath.ROLES;

  public readonly paginatedResourceLoader = new PaginatedResourceLoader({
    fetchData: (request) => this.usersApi.paginatedUsers(request),
    defaultFilters: {
      roleId: this.route.snapshot.params['id'],
      roleIdMatchMode: FilterMatchMode.CONTAINS,
    },
  });

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData() {
    this.roleService.getRoleById(this.route.snapshot.params['id']).subscribe({
      next: (role) => {
        this.role.set(role);
      },
    });
  }

  public openUsersSelectionDialog() {
    this.roleService
      .getUnassignedUsers(this.route.snapshot.params['id'])
      .pipe(
        switchMap(
          (users) => this.dialogService.openUsersSelectionDialog({ users })?.onClose ?? of(null)
        ),
        switchMap((users?: UserOption[]) =>
          users
            ? this.roleService.assignUsersToRole(
                this.route.snapshot.params['id'],
                users.map((user) => user.id)
              )
            : of(null)
        )
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.paginatedResourceLoader.refresh();
          }
        },
      });
  }

  /**
   * Remove user from role
   * @param user
   */
  public removeUserFromRole(user: ListUser) {
    this.confirm.open({
      message: this.translateService.instant('roles.userRoles.removeUserFromRoleConfirmation', {
        userName: user.username,
      }),
      accept: () => {
        this.roleService.unassignUserFromRole(this.route.snapshot.params['id'], user.id).subscribe({
          next: () => {
            this.paginatedResourceLoader.refresh();
          },
        });
      },
    });
  }
}
