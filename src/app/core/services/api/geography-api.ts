import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { ApiResponse } from '../../models/api-response-models';
import {
  CountryOption,
  CountyOption,
  LocalityOption,
  StateOption,
  PhoneCodeDto,
} from '@core/models/geography-models';

@Injectable({
  providedIn: 'root',
})
export class GeographyApi {
  private readonly baseUrl = API_CONFIG.BASE_URL;
  private readonly http = inject(HttpClient);

  /**
   * Get all phone codes with country information
   * @returns Observable with array of PhoneCodeDto
   */
  public getPhoneCodes(): Observable<PhoneCodeDto[]> {
    return this.http
      .get<ApiResponse<PhoneCodeDto[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.GEOGRAPHY.PHONE_CODES}`
      )
      .pipe(map((response) => response.data || []));
  }

  public getCountries(): Observable<CountryOption[]> {
    return this.http
      .get<ApiResponse<CountryOption[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.GEOGRAPHY.COUNTRIES}`
      )
      .pipe(map((response) => response.data || []));
  }

  public getStates(countryId: string): Observable<StateOption[]> {
    return this.http
      .get<ApiResponse<StateOption[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.GEOGRAPHY.STATES(countryId)}`
      )
      .pipe(map((response) => response.data || []));
  }

  public getCounties(stateId: string): Observable<CountyOption[]> {
    return this.http
      .get<ApiResponse<CountyOption[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.GEOGRAPHY.COUNTIES(stateId)}`
      )
      .pipe(map((response) => response.data || []));
  }

  public getLocalitiesByStateId(stateId: string): Observable<LocalityOption[]> {
    return this.http
      .get<ApiResponse<LocalityOption[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.GEOGRAPHY.LOCALITIES_BY_STATE_ID(stateId)}`
      )
      .pipe(map((response) => response.data || []));
  }
}
