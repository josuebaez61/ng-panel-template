import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Role } from '@core/models';
import { RolesApi } from '@core/services';
import { ActivatedRoute } from '@angular/router';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { RoutePath } from '@core/constants';
import { PermissionsManager } from '@shared/components/permissions-manager/permissions-manager';
import { PermissionsManagerConfig } from '@shared/components/permissions-manager/permissions-manager-config';

@Component({
  selector: 'app-role-permissions',
  imports: [PanelPageHeader, PermissionsManager],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissions implements OnInit {
  private readonly roleService = inject(RolesApi);
  private readonly activatedRoute = inject(ActivatedRoute);

  public roleId = this.activatedRoute.snapshot.params['id'];
  public backRoute = RoutePath.ROLES;
  public role = signal<Role | null>(null);

  public permissionsConfig = signal<PermissionsManagerConfig<Role> | null>(null);

  public ngOnInit(): void {
    this.permissionsConfig.set({
      entityId: this.roleId,
      getEntity: (id: string) => this.roleService.getRoleById(id),
      getPermissions: (id: string) => this.roleService.getRolePermissions(id),
      updatePermissions: (id: string, permissionIds: string[]) =>
        this.roleService.updateRolePermissions(id, permissionIds),
      backRoute: this.backRoute,
      translations: {
        title: 'roles.permissions.title',
        description: 'roles.permissions.description',
        resourceKey: 'roles.permissions.resources',
        permissionNameKey: 'roles.permissions.names',
      },
    });
  }

  public onEntityLoaded(role: Role): void {
    this.role.set(role);
  }
}
