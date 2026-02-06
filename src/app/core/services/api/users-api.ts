import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import {
  ListUser,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  Person,
  UpdatePersonRequest,
} from '../../models/user-models';
import { API_CONFIG } from '../../config/api.config';
import { ApiResponse } from '../../models/api-response-models';
import { Role } from '../../models/role-models';
import {
  UserAddress,
  UpdateAddressRequest,
  ApiPaginationResponse,
  PaginationRequest,
  AuthUser,
  AuthUserDto,
  Address,
} from '@core/models';
import { AuthService } from '../auth-service';

@Injectable({
  providedIn: 'root',
})
export class UsersApi {
  private readonly baseUrl = API_CONFIG.BASE_URL;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /**
   * Get all users with pagination and filtering
   */
  public getUsers(page = 1, pageSize = 10, filters?: any): Observable<any> {
    const params: any = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters,
    };

    return this.http.get(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.LIST}`, { params });
  }

  /**
   * Fetch paginated users from the API
   */
  public paginatedUsers(request: PaginationRequest): Observable<ApiPaginationResponse<ListUser>> {
    const params: any = {
      page: request.page.toString(),
      pageSize: request.pageSize.toString(),
    };

    if (request.globalSearch) {
      params.globalSearch = request.globalSearch;
    }

    if (request.sortBy) {
      params.sortBy = request.sortBy;
      params.sortDirection = request.sortDirection;
    }

    return this.http.get<ApiPaginationResponse<ListUser>>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.PAGINATED}`,
      {
        params: {
          ...params,
          ...request.filters,
        },
      }
    );
  }

  /**
   * Update user roles by user ID
   */
  public updateUserRoles(id: string, roleIds: string[]): Observable<ApiResponse<Role[]>> {
    return this.http.put<ApiResponse<Role[]>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE_ROLES_BY_USER_ID(id)}`,
      { roleIds }
    );
  }

  /**
   * Get user by ID
   */
  public getUserById(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.GET_BY_ID}/${id}`)
      .pipe(map((response) => response.data!));
  }

  /**
   * Get user roles by user ID
   */
  public getUserRoles(id: string): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.GET_ROLES_BY_USER_ID(id)}`
    );
  }

  /**
   * Create new user
   */
  public createUser(userData: CreateUserRequest): Observable<ListUser> {
    return this.http.post<ListUser>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.CREATE}`,
      userData
    );
  }

  /**
   * Update user
   */
  public updateUser(id: string, userData: UpdateUserRequest): Observable<ListUser> {
    return this.http.patch<ListUser>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE(id)}`,
      userData
    );
  }

  /**
   * Delete user
   */
  public deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.DELETE}/${id}`);
  }

  /**
   * Toggle user active status
   */
  public toggleUserStatus(id: string, isActive: boolean): Observable<ListUser> {
    return this.http.patch<ListUser>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE(id)}/status`,
      { isActive }
    );
  }

  /**
   * Assign roles to user
   */
  public assignRoles(userId: string, roleIds: string[]): Observable<ListUser> {
    return this.http.post<ListUser>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE_ROLES_BY_USER_ID(userId)}`,
      { roleIds }
    );
  }

  /**
   * Remove roles from user
   */
  public removeRoles(userId: string, roleIds: string[]): Observable<ListUser> {
    return this.http.delete<ListUser>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${userId}/roles`,
      { body: { roleIds } }
    );
  }

  /**
   * Activate user
   */
  public activateUser(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.ACTIVATE(id)}`,
      {}
    );
  }

  /**
   * Deactivate user
   */
  public deactivateUser(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.DEACTIVATE(id)}`,
      {}
    );
  }

  /**
   * Find all identification types
   */
  public findAllIdentificationTypes(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.FIND_ALL_IDENTIFICATION_TYPES}`
    );
  }

  /**
   * Update person
   */
  public updatePersonByUserId(userId: string, personData: UpdatePersonRequest): Observable<Person> {
    return this.http
      .patch<ApiResponse<Person>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE_USER_PERSON(userId)}`,
        personData
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Update current user person
   */
  public updateCurrentUserPerson(personData: UpdatePersonRequest): Observable<Person> {
    return this.http
      .patch<ApiResponse<Person>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE_CURRENT_USER_PERSON}`,
        personData
      )
      .pipe(
        map((response) => response.data!),
        tap(() => this.authService.hydrateUserData())
      );
  }

  /**
   * Get current user addresses
   */
  public getCurrentUserAddresses(): Observable<Address[]> {
    return this.http
      .get<ApiResponse<Address[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.GET_CURRENT_USER_ADDRESSES}`
      )
      .pipe(map((response) => response.data || []));
  }

  /**
   * Create current user address
   */
  public createCurrentUserAddress(address: UserAddress): Observable<UserAddress> {
    return this.http
      .post<ApiResponse<UserAddress>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.CREATE_CURRENT_USER_ADDRESS}`,
        address
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Update current user address
   */
  public updateCurrentUserAddress(
    id: string,
    address: UpdateAddressRequest
  ): Observable<UserAddress> {
    return this.http
      .put<ApiResponse<UserAddress>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE_CURRENT_USER_ADDRESS(id)}`,
        address
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Delete current user address
   */
  public deleteCurrentUserAddress(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.DELETE_CURRENT_USER_ADDRESS(id)}`
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Update current user data (for use in guards)
   */
  public updateCurrentUserData(user: AuthUser): Observable<any> {
    return this.http
      .patch<ApiResponse<AuthUserDto>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.UPDATE_CURRENT_USER_DATA}`,
        user
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.authService.hydrateUserData();
          }
        })
      );
  }

  public regenerateTemporaryPassword(userId: string): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.REGENERATE_TEMPORARY_PASSWORD(userId)}`,
      {}
    );
  }
}
