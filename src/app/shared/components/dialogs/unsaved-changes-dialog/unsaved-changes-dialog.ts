import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';

@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [TranslateModule, SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      header="{{ title() | translate }}"
      [modal]="false"
      [style]="{ width: '25rem' }"
      [visible]="visible()"
      [closeOnEscape]="false"
      [focusOnShow]="false"
      position="bottom"
      (visibleChange)="!$event && onDiscard()"
      styleClass="unsaved-changes-dialog"
      [draggable]="false"
    >
      <div class="flex flex-col flex-auto">
        <div class="font-medium text-md mb-4">
          {{ message() | translate }}
        </div>
        <div class="flex items-center justify-end gap-2">
          <p-button
            severity="contrast"
            size="small"
            [disabled]="discardButtonDisabled()"
            [label]="discardButtonText() | translate"
            (click)="onDiscard()"
          />
          <p-button
            severity="contrast"
            size="small"
            [disabled]="saveButtonDisabled()"
            [label]="saveButtonText() | translate"
            (click)="onSave()"
          />
        </div>
      </div>
    </p-dialog>
  `,
  styles: ``,
})
export class UnsavedChangesDialog {
  public visible = input<boolean>(false);
  public message = input<string>('unsavedChanges.description');
  public title = input<string>('unsavedChanges.title');
  public saveButtonText = input<string>('unsavedChanges.save');
  public discardButtonText = input<string>('unsavedChanges.discard');
  public saveButtonDisabled = input<boolean>(false);
  public discardButtonDisabled = input<boolean>(false);

  public save = output<void>();
  public discard = output<void>();

  public onSave(): void {
    this.save.emit();
  }

  public onDiscard(): void {
    this.discard.emit();
  }
}
