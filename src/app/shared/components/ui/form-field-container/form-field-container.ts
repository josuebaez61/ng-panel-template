import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-field-container',
  imports: [TranslateModule],
  templateUrl: './form-field-container.html',
  styleUrl: './form-field-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldContainer implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();
  public ngControl = contentChild<NgControl>(NgControl);
  
  // Signal to track control state for change detection
  private controlState = signal<{ invalid: boolean; touched: boolean }>({
    invalid: false,
    touched: false,
  });

  public controlIsRequired = computed(() => {
    return this.ngControl()?.control?.hasValidator(Validators.required);
  });

  public showError = computed(() => {
    return this.controlState().invalid && this.controlState().touched;
  });

  constructor() {
    // Subscribe to control changes to trigger change detection
    effect(() => {
      // Unsubscribe from previous subscriptions
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();

      const ngControl = this.ngControl();
      const control = ngControl?.control;
      
      if (control) {
        // Update state signal when control state changes
        const updateState = () => {
          const newState = {
            invalid: control.invalid,
            touched: control.touched,
          };
          // Only update if state actually changed to avoid unnecessary updates
          const currentState = this.controlState();
          if (
            currentState.invalid !== newState.invalid ||
            currentState.touched !== newState.touched
          ) {
            this.controlState.set(newState);
            this.cdr.markForCheck();
          }
        };

        // Initial state update - force check
        updateState();
        this.cdr.markForCheck();

        // Subscribe to status and value changes to detect validation state changes
        this.subscriptions.add(
          control.statusChanges.subscribe(() => {
            updateState();
          })
        );
        this.subscriptions.add(
          control.valueChanges.subscribe(() => {
            updateState();
          })
        );

        // Also subscribe to events to catch touch events (blur, focus, etc.)
        this.subscriptions.add(
          control.events.subscribe(() => {
            updateState();
          })
        );
      } else {
        // Reset state when control is null
        this.controlState.set({ invalid: false, touched: false });
        this.cdr.markForCheck();
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
