import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_TABLE_PAGE_SIZE_OPTIONS } from '@core/constants';
import { ApiKey } from '@core/models';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { BadgeModule } from 'primeng/badge';
import { LocalizedDatePipe } from '@shared/pipes';

@Component({
  selector: 'app-api-keys-table',
  imports: [
    SharedModule,
    TableModule,
    IconField,
    InputIcon,
    TranslateModule,
    BadgeModule,
    LocalizedDatePipe,
  ],
  templateUrl: './api-keys-table.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeysTable {
  public loading = input<boolean>(false);
  public apiKeys = input<ApiKey[]>([]);
  public paginator = input<boolean>(false);
  public totalCount = input<number>(0);
  public lazy = input<boolean>(false);
  public lazyLoad = output<TableLazyLoadEvent>();
  public actionsColumnTemplate = input<TemplateRef<any>>();
  public pageSize = input<number>(DEFAULT_TABLE_PAGE_SIZE);
  public pageSizeOptions = input<number[]>(DEFAULT_TABLE_PAGE_SIZE_OPTIONS);
}

