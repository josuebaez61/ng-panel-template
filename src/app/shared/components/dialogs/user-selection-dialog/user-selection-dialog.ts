import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UserOption, UsersSelectionDialogData } from '@core/models';
import { UserSelection } from '@shared/components/inputs/user-selection/user-selection';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DialogActions } from '@shared/directives';

@Component({
  selector: 'app-user-selection-dialog',
  imports: [CommonModule, UserSelection, ButtonModule, TranslateModule, FormsModule, DialogActions],
  templateUrl: './user-selection-dialog.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSelectionDialog {
  public readonly dialogRef = inject(DynamicDialogRef<UserSelectionDialog>);
  private readonly dialogConfig = inject(DynamicDialogConfig<UsersSelectionDialogData>);

  public selectedUsers: UserOption[] = [];

  public users = computed(() => this.dialogConfig.data.users);

  public onLazyLoad() {
    this.dialogConfig.data.onScrolled();
  }

  public onConfirm() {
    this.dialogRef.close(this.selectedUsers);
  }
}
