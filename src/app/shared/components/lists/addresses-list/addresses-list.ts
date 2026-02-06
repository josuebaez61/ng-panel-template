import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';
import { Address } from '@core/models/address-models';
import { SharedModule } from '@shared/modules';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-addresses-list',
  imports: [SharedModule, DataViewModule, TagModule, SkeletonModule],
  templateUrl: './addresses-list.html',
  styleUrl: './addresses-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressesList {
  public actionsTemplate = input<TemplateRef<any>>();
  public addresses = input<Address[]>();
  public loading = input<boolean>(false);
}
