import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_TABLE_PAGE_SIZE_OPTIONS } from '@core/constants';
import { RoleWithUsersCount } from '@core/models';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { BadgeModule } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { LocalizedDatePipe } from '@shared/pipes';

@Component({
  selector: 'app-roles-table',
  imports: [
    SharedModule,
    TableModule,
    IconField,
    InputIcon,
    TranslateModule,
    BadgeModule,
    Chip,
    LocalizedDatePipe,
  ],
  templateUrl: './roles-table.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesTable {
  public loading = input<boolean>(false);
  public roles = input<RoleWithUsersCount[]>([]);
  public paginator = input<boolean>(false);
  public totalCount = input<number>(0);
  public lazy = input<boolean>(false);
  public lazyLoad = output<TableLazyLoadEvent>();
  public canAssignRoles = input<boolean>(false);
  public actionsColumnTemplate = input<TemplateRef<any>>();
  public pageSize = input<number>(DEFAULT_TABLE_PAGE_SIZE);
  public pageSizeOptions = input<number[]>(DEFAULT_TABLE_PAGE_SIZE_OPTIONS);
}
