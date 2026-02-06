import { ChangeDetectionStrategy, Component, forwardRef, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-input-color',
  imports: [CommonModule, FormsModule, InputTextModule, InputGroup, InputGroupAddon],
  templateUrl: './input-color.html',
  styleUrl: './input-color.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputColor),
      multi: true,
    },
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputColor implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  // Internal state
  private _value = signal<string>('');
  private _disabled = signal<boolean>(false);

  // ControlValueAccessor implementation
  private onChange = (_value: string): void => {
    // Value change handler - implemented by Angular forms
  };
  private onTouched = (): void => {
    // Touch handler - implemented by Angular forms
  };

  // Getters
  public get value(): string {
    return this._value();
  }

  public get disabled(): boolean {
    return this._disabled();
  }

  // ControlValueAccessor methods
  public writeValue(value: string): void {
    if (!value) {
      this._value.set('');
      return;
    }
    // Ensure value is a valid hex color (with or without #)
    const hexValue = value.startsWith('#') ? value : `#${value}`;
    this._value.set(hexValue);
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  // Handle color input change
  public onColorInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.updateValue(value);
  }

  // Handle text input change
  public onTextInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.trim();

    // Remove # if present (we'll add it back)
    value = value.replace(/^#/, '');

    // Validate hex color format (3 or 6 hex digits)
    if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(value)) {
      const hexValue = `#${value}`;
      this.updateValue(hexValue);
    } else if (value === '') {
      // Allow empty value
      this.updateValue('');
    } else {
      // Invalid format, revert to previous value
      input.value = this._value().replace(/^#/, '');
    }
  }

  // Update the value and notify Angular forms
  private updateValue(newValue: string): void {
    this._value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.cdr.detectChanges();
  }

  // Get the hex value without # for the text input
  public get hexValueWithoutHash(): string {
    const value = this._value();
    return value.replace(/^#/, '');
  }
}
