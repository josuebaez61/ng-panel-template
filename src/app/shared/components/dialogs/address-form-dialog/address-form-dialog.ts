import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { SharedModule } from '@shared/modules';
import { Subject } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddressForm } from '@shared/components/templates/address-form/address-form';
import { DialogActions } from '@shared/directives';

@Component({
  selector: 'app-address-form-dialog',
  imports: [SharedModule, AddressForm, DialogActions],
  templateUrl: './address-form-dialog.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormDialog implements OnDestroy {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  public destroyed$ = new Subject<void>();

  public address = computed(() => this.config.data?.address || null);

  @ViewChild(AddressForm, { static: false })
  public addressFormComponent!: AddressForm;

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public onSubmit(): void {
    const formGroup = this.addressFormComponent.form;
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
    } else {
      this.dialogRef.close(formGroup.value);
    }
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
