import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/config/api.config';
import { ApiResponse, ResourcePermissions } from '@core/models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionsApi {
  private baseUrl = API_CONFIG.BASE_URL;

  private http = inject(HttpClient);

  public getAllResourcesPermissions(): Observable<ResourcePermissions[]> {
    return this.http
      .get<ApiResponse<ResourcePermissions[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.PERMISSIONS.BY_RESOURCE}`
      )
      .pipe(map((response) => response.data!));
  }
}
