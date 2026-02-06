import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appIfControlError]',
  standalone: true,
})
export class IfControlErrorDirective implements OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);

  private control: AbstractControl | null = null;
  private subscriptions = new Subscription();
  private hasView = false;

  @Input()
  public set appIfControlError(control: AbstractControl | null) {
    // Unsubscribe from previous control if exists
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    this.control = control;

    if (control) {
      // Subscribe to control events to detect touch events
      this.subscriptions.add(
        control.events.subscribe(() => {
          this.updateView();
        })
      );

      // Also subscribe to statusChanges to catch validation state changes
      this.subscriptions.add(
        control.statusChanges.subscribe(() => {
          this.updateView();
        })
      );

      // Initial check
      this.updateView();
    } else {
      // Clear view if control is null
      this.clearView();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateView(): void {
    if (!this.control) {
      this.clearView();
      return;
    }

    const shouldShow = this.control.invalid && this.control.touched;

    if (shouldShow) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      this.clearView();
    }
  }

  private clearView(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
