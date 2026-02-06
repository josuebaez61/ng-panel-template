import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ApiKey } from '@core/models';
import { ApiKeysApi } from '@core/services';
import { ActivatedRoute } from '@angular/router';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { RoutePath } from '@core/constants';
import { PermissionsManager } from '@shared/components/permissions-manager/permissions-manager';
import { PermissionsManagerConfig } from '@shared/components/permissions-manager/permissions-manager-config';

@Component({
  selector: 'app-api-key-permissions',
  imports: [PanelPageHeader, PermissionsManager],
  templateUrl: './api-key-permissions.html',
  styleUrl: './api-key-permissions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyPermissions implements OnInit {
  private readonly apiKeysApi = inject(ApiKeysApi);
  private readonly activatedRoute = inject(ActivatedRoute);

  public apiKeyId = this.activatedRoute.snapshot.params['id'];
  public backRoute = RoutePath.API_KEYS;
  public apiKey = signal<ApiKey | null>(null);

  public permissionsConfig = signal<PermissionsManagerConfig<ApiKey> | null>(null);

  public ngOnInit(): void {
    this.permissionsConfig.set({
      entityId: this.apiKeyId,
      getEntity: (id: string) => this.apiKeysApi.getApiKeyById(id),
      getPermissions: (id: string) => this.apiKeysApi.getApiKeyPermissions(id),
      getResourcesPermissions: () => this.apiKeysApi.getApiKeyResourcesPermissions(),
      updatePermissions: (id: string, permissionIds: string[]) =>
        this.apiKeysApi.updateApiKeyPermissions(id, permissionIds),
      backRoute: this.backRoute,
      translations: {
        title: 'apiKeys.permissions.title',
        description: 'apiKeys.permissions.description',
        resourceKey: 'apiKeys.permissions.resources',
        permissionNameKey: 'apiKeys.permissions.names',
      },
    });
  }

  public onEntityLoaded(apiKey: ApiKey): void {
    this.apiKey.set(apiKey);
  }
}
