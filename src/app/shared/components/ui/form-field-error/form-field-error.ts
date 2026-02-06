import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IfControlErrorDirective } from '@shared/directives';
import { MessageModule } from 'primeng/message';
import { FormErrorMessagePipe } from '@shared/pipes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-field-error',
  templateUrl: './form-field-error.html',
  imports: [IfControlErrorDirective, MessageModule, FormErrorMessagePipe],
  styleUrl: './form-field-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();
  public control = input.required<AbstractControl>();

  constructor() {
    // Subscribe to control changes to trigger change detection
    effect(() => {
      // Unsubscribe from previous subscriptions
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();

      const control = this.control();
      if (control) {
        // Subscribe to status and value changes to detect validation state changes
        this.subscriptions.add(
          control.statusChanges.subscribe(() => {
            this.cdr.markForCheck();
          })
        );
        this.subscriptions.add(
          control.valueChanges.subscribe(() => {
            this.cdr.markForCheck();
          })
        );
        // Also subscribe to events to catch touch events (blur, etc.)
        this.subscriptions.add(
          control.events.subscribe(() => {
            this.cdr.markForCheck();
          })
        );
      }
    });
  }

  public ngOnInit(): void {
    // Force initial change detection check when component is created
    // This ensures the component updates even if control is already in final state
    this.cdr.markForCheck();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
