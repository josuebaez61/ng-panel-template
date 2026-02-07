import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/config/api.config';
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
  private baseUrl = API_CONFIG.BASE_URL;
  private http = inject(HttpClient);

  public getOrganization(organizationId: string): Observable<Organization> {
    return this.http
      .get<ApiResponse<Organization>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.GET_BY_ID(organizationId)}`
      )
      .pipe(map((response) => response.data!));
  }

  public updateOrganization(
    organizationId: string,
    organization: UpdateOrganizationRequest,
    file?: File
  ): Observable<Organization> {
    if (file) {
      // If file is provided, use FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Append other fields to FormData (excluding logoUrl as backend generates it)
      Object.keys(organization).forEach((key) => {
        const value = organization[key as keyof UpdateOrganizationRequest];
        // Skip logoUrl when file is provided, backend will generate it
        if (key === 'logoUrl') {
          return;
        }
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      return this.http
        .patch<ApiResponse<Organization>>(
          `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.UPDATE(organizationId)}`,
          formData
        )
        .pipe(map((response) => response.data!));
    } else {
      // If no file, send JSON as before
      return this.http
        .patch<ApiResponse<Organization>>(
          `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.UPDATE(organizationId)}`,
          organization
        )
        .pipe(map((response) => response.data!));
    }
  }

  public getOrganizationSettings(organizationId: string): Observable<OrganizationSettings> {
    return this.http
      .get<ApiResponse<OrganizationSettings>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.GET_SETTINGS(organizationId)}`
      )
      .pipe(map((response) => response.data!));
  }

  public updateOrganizationSettings(
    organizationId: string,
    settings: UpdateOrganizationSettingsRequest
  ): Observable<OrganizationSettings> {
    return this.http
      .put<ApiResponse<OrganizationSettings>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.UPDATE_SETTINGS(organizationId)}`,
        settings
      )
      .pipe(map((response) => response.data!));
  }

  public uploadLogo(organizationId: string, file: File): Observable<HttpEvent<ApiResponse<{ logoUrl: string }>>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ logoUrl: string }>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.UPLOAD_LOGO(organizationId)}`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }
}
