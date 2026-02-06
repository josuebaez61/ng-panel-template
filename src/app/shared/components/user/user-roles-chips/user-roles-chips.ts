import { Component, computed, inject, input } from '@angular/core';
import { PermissionName, Role } from '@core/models';
import { ChipModule } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { AuthState } from '@core/services';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ButtonModule } from 'primeng/button';
import { RoutePath } from '@core/constants';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-roles-chips',
  imports: [
    FormsModule,
    ChipModule,
    PopoverModule,
    SkeletonModule,
    ButtonModule,
    ConfirmPopupModule,
    RouterModule,
  ],
  templateUrl: './user-roles-chips.html',
  styles: ``,
})
export class UserRolesChips {
  private readonly authState = inject(AuthState);
  public currentUser = computed(() => this.authState.currentUser());
  public roles = input<Role[]>([]);
  public roleUsersPath = (roleId: string) => RoutePath.ROLES_USERS(roleId);
  public canAssignRoles = computed(
    () => !!this.currentUser()?.hasPermission(PermissionName.ASSIGN_ROLE)
  );
}
