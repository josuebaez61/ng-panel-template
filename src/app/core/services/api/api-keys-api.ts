import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '../../models/api-key-models';
import { API_CONFIG } from '../../config/api.config';
import { ApiResponse } from '../../models/api-response-models';
import { Permission, ResourcePermissions } from '../../models/permission-models';

@Injectable({
  providedIn: 'root',
})
export class ApiKeysApi {
  private baseUrl = API_CONFIG.BASE_URL;
  private http = inject(HttpClient);

  /**
   * Get all API keys
   */
  public getAllApiKeys(): Observable<ApiKey[]> {
    return this.http
      .get<ApiResponse<ApiKey[]>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.ALL}`)
      .pipe(map((response) => response.data || []));
  }

  /**
   * Get API key by ID
   */
  public getApiKeyById(id: string): Observable<ApiKey> {
    return this.http
      .get<ApiResponse<ApiKey>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.GET_BY_ID(id)}`)
      .pipe(map((response) => response.data!));
  }

  /**
   * Create new API key
   */
  public createApiKey(apiKeyData: CreateApiKeyRequest): Observable<ApiKey> {
    return this.http
      .post<ApiResponse<ApiKey>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.CREATE}`,
        apiKeyData
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Update API key
   */
  public updateApiKey(id: string, apiKeyData: UpdateApiKeyRequest): Observable<ApiKey> {
    return this.http
      .patch<ApiResponse<ApiKey>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.UPDATE(id)}`,
        apiKeyData
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Delete API key
   */
  public deleteApiKey(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.DELETE(id)}`
    );
  }

  /**
   * Toggle API key active status
   */
  public toggleApiKeyStatus(id: string): Observable<ApiKey> {
    return this.http
      .patch<ApiResponse<ApiKey>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.TOGGLE(id)}`, {})
      .pipe(map((response) => response.data!));
  }

  /**
   * Get permissions assigned to an API key
   */
  public getApiKeyPermissions(apiKeyId: string): Observable<Permission[]> {
    return this.http
      .get<ApiResponse<Permission[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.GET_BY_ID(apiKeyId)}/permissions`
      )
      .pipe(map((response) => response.data || []));
  }

  /**
   * Update API key permissions
   */
  public updateApiKeyPermissions(apiKeyId: string, permissionIds: string[]): Observable<ApiKey> {
    return this.http
      .put<ApiResponse<ApiKey>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.GET_BY_ID(apiKeyId)}/permissions`,
        { permissionIds }
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Get all permissions grouped by resource for API keys
   */
  public getApiKeyResourcesPermissions(): Observable<ResourcePermissions[]> {
    return this.http
      .get<ApiResponse<ResourcePermissions[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.API_KEYS.PERMISSIONS_GROUPED_BY_RESOURCE}`
      )
      .pipe(map((response) => response.data || []));
  }
}
