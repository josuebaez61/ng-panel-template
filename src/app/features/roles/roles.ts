import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PermissionName, RoleWithUsersCount } from '@core/models';
import { AuthState, Confirm, DialogService, RolesApi } from '@core/services';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { RolesTable } from '@shared/components/lists/table/roles-table/roles-table';
import { forkJoin } from 'rxjs';
import { SharedModule } from '@shared/modules';
import { RoutePath } from '@core/constants';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-roles',
  imports: [PanelPageHeader, RolesTable, SharedModule, RouterLink],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles implements OnInit {
  private readonly authState = inject(AuthState);
  private readonly roleService = inject(RolesApi);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);
  private readonly confirm = inject(Confirm);
  public roles = signal<RoleWithUsersCount[]>([]);
  public loading = signal<boolean>(false);
  public roleUsersPath = RoutePath.ROLES_USERS;
  public rolePermissionsPath = RoutePath.ROLES_PERMISSIONS;

  public canWriteRoles = computed(
    () => !!this.authState.currentUser()?.hasPermission(PermissionName.WRITE_ROLE)
  );

  public canAssignPermissions = computed(
    () => !!this.authState.currentUser()?.hasPermission(PermissionName.ASSIGN_PERMISSION)
  );

  public canAssignRoles = computed(
    () => !!this.authState.currentUser()?.hasPermission(PermissionName.ASSIGN_ROLE)
  );

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData() {
    this.loading.set(true);
    forkJoin([this.roleService.getAllRoles(), this.roleService.getRoleUserCount()]).subscribe({
      next: ([roles, roleUsersCounts]) => {
        this.roles.set(
          roles.map((role) => ({ ...role, usersCount: roleUsersCounts[role.id] || 0 }))
        );
      },
      error: () => {
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  public openRoleForm(role?: RoleWithUsersCount) {
    this.dialogService.openRoleFormDialog(role)?.onClose.subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  public deleteRole(role: RoleWithUsersCount) {
    this.confirm.open({
      message: this.translateService.instant('roles.form.deleteRoleConfirmation', {
        roleName: role.name,
      }),
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe(() => this.loadData());
      },
    });
  }
}
