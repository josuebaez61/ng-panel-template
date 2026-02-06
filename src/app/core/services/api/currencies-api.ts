import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_CONFIG } from '../../config/api.config';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response-models';
import { Currency } from '../../models/currency-models';

@Injectable({
  providedIn: 'root',
})
export class CurrenciesApi {
  private baseUrl = API_CONFIG.BASE_URL;
  private http = inject(HttpClient);

  public getCurrencies(): Observable<Currency[]> {
    return this.http
      .get<ApiResponse<Currency[]>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CURRENCIES.ALL}`)
      .pipe(map((response) => response.data!));
  }

  public getCurrencyById(id: string): Observable<Currency> {
    return this.http
      .get<ApiResponse<Currency>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CURRENCIES.GET_BY_ID(id)}`)
      .pipe(map((response) => response.data!));
  }
}
