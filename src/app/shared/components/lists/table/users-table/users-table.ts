import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input, output } from '@angular/core';
import { ListUser, PermissionName } from '@core/models';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { TableLazyLoadEvent } from 'primeng/table';
import { UserAvatar } from '@shared/components/user/user-avatar/user-avatar';
import { UserRolesChips } from '@shared/components/user/user-roles-chips/user-roles-chips';
import { LocalizedDatePipe } from '@shared/pipes';
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_TABLE_PAGE_SIZE_OPTIONS } from '@core/constants';
import { AuthState } from '@core/services';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-users-table',
  imports: [
    SharedModule,
    TranslateModule,
    UserAvatar,
    UserRolesChips,
    LocalizedDatePipe,
    ChipModule,
  ],
  templateUrl: './users-table.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  public loading = input<boolean>(false);
  public users = input<ListUser[]>([]);
  public paginator = input<boolean>(false);
  public totalCount = input<number>(0);
  public lazy = input<boolean>(false);
  public lazyLoad = output<TableLazyLoadEvent>();
  public canAssignRoles = input<boolean>(false);
  public actionsColumnTemplate = input<TemplateRef<any>>();
  public filtersRowTemplate = input<TemplateRef<any>>();
  public pageSize = input<number>(DEFAULT_TABLE_PAGE_SIZE);
  public pageSizeOptions = input<number[]>(DEFAULT_TABLE_PAGE_SIZE_OPTIONS);

  private readonly authState = inject(AuthState);
  public currentUser = computed(() => this.authState.currentUser());
  public canManageUserRoles = computed(() =>
    this.currentUser()?.hasPermission(PermissionName.ASSIGN_ROLE)
  );
}
