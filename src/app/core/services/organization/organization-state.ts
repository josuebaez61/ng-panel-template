import { Injectable, inject, signal } from '@angular/core';
import { Organization } from '@core/models';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrganizationApi } from '../api/organization-api';
import { GlobalSpinnerService } from '../loading/global-spinner-service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationState {
  public readonly organizationId = environment.organizationId;
  private readonly _organization = signal<Organization | null>(null);
  private readonly _isInitialized = signal(false);
  public organization = this._organization.asReadonly();
  public isInitialized = this._isInitialized.asReadonly();

  private readonly organizationApi = inject(OrganizationApi);
  private readonly globalSpinnerService = inject(GlobalSpinnerService);

  /**
   * Initialize organization data
   * Should be called during app initialization
   */
  public initialize(): Observable<Organization | null> {
    if (this._isInitialized()) {
      return of(this._organization());
    }

    this.globalSpinnerService.setIsLoading(true);
    return this.organizationApi.getOrganization(this.organizationId).pipe(
      tap((organization) => {
        this._organization.set(organization);
        this._isInitialized.set(true);
        this.globalSpinnerService.setIsLoading(false);
      }),
      catchError((error) => {
        this.globalSpinnerService.setIsLoading(false);
        console.error('Failed to load organization data:', error);
        return of(null);
      })
    );
  }

  /**
   * Refresh organization data from API
   * Should be called after updating organization or logo
   */
  public refresh(): Observable<Organization | null> {
    return this.organizationApi.getOrganization(this.organizationId).pipe(
      tap((organization) => {
        this._organization.set(organization);
      }),
      catchError((error) => {
        console.error('Failed to refresh organization data:', error);
        return of(null);
      })
    );
  }
}
