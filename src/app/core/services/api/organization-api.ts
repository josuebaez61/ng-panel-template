import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/config/api.config';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response-models';
import {
  Organization,
  OrganizationSettings,
  UpdateOrganizationRequest,
  UpdateOrganizationSettingsRequest,
} from '@core/models/organization-models';

@Injectable({
  providedIn: 'root',
})
export class OrganizationApi {
  public readonly companyId = environment.companyId;
  private baseUrl = API_CONFIG.BASE_URL;
  private http = inject(HttpClient);

  public getOrganization(): Observable<Organization> {
    return this.http
      .get<ApiResponse<Organization>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.GET_BY_ID(this.companyId)}`
      )
      .pipe(map((response) => response.data!));
  }

  public updateOrganization(organization: UpdateOrganizationRequest): Observable<Organization> {
    return this.http
      .patch<ApiResponse<Organization>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.UPDATE(this.companyId)}`,
        organization
      )
      .pipe(map((response) => response.data!));
  }

  public getOrganizationSettings(): Observable<OrganizationSettings> {
    return this.http
      .get<ApiResponse<OrganizationSettings>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.GET_SETTINGS(this.companyId)}`
      )
      .pipe(map((response) => response.data!));
  }

  public updateOrganizationSettings(
    settings: UpdateOrganizationSettingsRequest
  ): Observable<OrganizationSettings> {
    return this.http
      .put<ApiResponse<OrganizationSettings>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.UPDATE_SETTINGS(this.companyId)}`,
        settings
      )
      .pipe(map((response) => response.data!));
  }
}
