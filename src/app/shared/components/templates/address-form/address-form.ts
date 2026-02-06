import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { SelectModule } from 'primeng/select';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { GeographyApi } from '@core/services/api/geography-api';
import {
  CountryOption,
  CountyOption,
  LocalityOption,
  StateOption,
} from '@core/models/geography-models';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';
import { Address } from '@core/models/address-models';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';

@Component({
  selector: 'app-address-form',
  imports: [
    SharedModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    SelectModule,
    AutoCompleteModule,
    TranslateModule,
    FormFieldContainer,
    FormFieldError,
    ReactiveFormsModule,
  ],
  templateUrl: './address-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm implements OnDestroy {
  private readonly geographyApi = inject(GeographyApi);

  public countries = signal<CountryOption[]>([]);
  public states = signal<StateOption[]>([]);
  public counties = signal<CountyOption[]>([]);
  public localities = signal<LocalityOption[]>([]);

  public filteredLocalities = signal<LocalityOption[]>([]);
  public destroyed$ = new Subject<void>();
  public dialogRef = inject(DynamicDialogRef);
  public loadingData = signal<boolean>(false);

  public address = input<Address | undefined>(undefined);

  public nameControl = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  public addressControl = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  public stateIdControl = new FormControl('', [Validators.required]);
  public postalCodeControl = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  public countryIdControl = new FormControl('', [Validators.required]);
  public directionsControl = new FormControl('');
  public localityControl = new FormControl('', [Validators.required, Validators.maxLength(255)]);

  public form = new FormGroup({
    name: this.nameControl,
    address: this.addressControl,
    stateId: this.stateIdControl,
    postalCode: this.postalCodeControl,
    countryId: this.countryIdControl,
    directions: this.directionsControl,
    locality: this.localityControl,
  });

  constructor() {
    this.subscribeToCountryIdChanges();
    this.subscribeToStateIdChanges();
    this.loadData();
  }
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public subscribeToCountryIdChanges(): void {
    this.countryIdControl.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        filter((value) => value !== null),
        tap((_value) => {
          this.stateIdControl.setValue('');
          this.localityControl.setValue('');
        })
      )
      .subscribe();
  }

  public subscribeToStateIdChanges(): void {
    this.stateIdControl.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        filter((value) => value !== null),
        tap((_value) => {
          this.localityControl.setValue('');
        })
      )
      .subscribe();
  }

  public loadData(): void {
    this.loadingData.set(true);
    this.geographyApi
      .getCountries()
      .pipe(
        tap(() => {
          const countryId = this.address()?.countryId;
          if (countryId) {
            this.loadStates(countryId);
          }
        })
      )
      .subscribe({
        next: (countries) => {
          this.countries.set(countries);
          this.loadingData.set(false);
        },
        error: () => {
          this.loadingData.set(false);
        },
      });
  }

  public patchForm(): void {
    if (this.address()) {
      this.form.patchValue(
        {
          name: this.address()?.name,
          address: this.address()?.address,
          stateId: this.address()?.stateId,
          postalCode: this.address()?.postalCode,
          countryId: this.address()?.countryId,
          directions: this.address()?.directions,
          locality: this.address()?.locality,
        },
        { emitEvent: false }
      );
    }
  }

  public loadStates(countryId: string): void {
    this.loadingData.set(true);
    this.geographyApi.getStates(countryId).subscribe({
      next: (states) => {
        this.states.set(states);
        this.loadingData.set(false);
        this.patchForm();
      },
      error: () => {
        this.loadingData.set(false);
      },
    });
  }

  public loadLocalities(stateId: string): void {
    this.loadingData.set(true);
    this.geographyApi.getLocalitiesByStateId(stateId).subscribe({
      next: (localities) => {
        this.localities.set(localities);
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
      },
    });
  }

  public onCountrySelect(event: SelectChangeEvent): void {
    this.loadStates(event.value as string);
  }

  public onStateSelect(event: SelectChangeEvent): void {
    this.loadLocalities(event.value as string);
  }

  public onLocalitySelect(event: AutoCompleteSelectEvent): void {
    this.localityControl.setValue(event.value.name);
  }

  public filterLocalities(event: AutoCompleteCompleteEvent): void {
    this.localityControl.setValue(event.query);
    this.filteredLocalities.set(
      this.localities().filter((locality) =>
        locality.name.toLowerCase().includes(event.query.toLowerCase())
      )
    );
  }
}
