import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiKey } from '@core/models';
import { ApiKeysApi, AuthState, Confirm, DialogService } from '@core/services';
import { PanelPageHeader } from '@shared/components/layout/panel-page-header/panel-page-header';
import { ApiKeysTable } from '@shared/components/lists/table/api-keys-table/api-keys-table';
import { SharedModule } from '@shared/modules';
import { TranslateService } from '@ngx-translate/core';
import { RoutePath } from '@core/constants';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-api-keys',
  imports: [PanelPageHeader, ApiKeysTable, SharedModule, RouterLink],
  templateUrl: './api-keys.html',
  styleUrl: './api-keys.scss',
})
export class ApiKeys implements OnInit {
  private readonly authState = inject(AuthState);
  private readonly apiKeysService = inject(ApiKeysApi);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);
  private readonly confirm = inject(Confirm);
  public apiKeys = signal<ApiKey[]>([]);
  public loading = signal<boolean>(false);
  public apiKeyPermissionsPath = RoutePath.API_KEYS_PERMISSIONS;

  public canCreateApiKeys = computed(() => {
    // TODO: Add permission check when permissions are defined
    return true;
  });

  public canUpdateApiKeys = computed(() => {
    // TODO: Add permission check when permissions are defined
    return true;
  });

  public canAssignPermissions = computed(() => {
    // TODO: Add permission check when permissions are defined
    return true;
  });

  public canDeleteApiKeys = computed(() => {
    // TODO: Add permission check when permissions are defined
    return true;
  });

  public canToggleApiKeys = computed(() => {
    // TODO: Add permission check when permissions are defined
    return true;
  });

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading.set(true);
    this.apiKeysService.getAllApiKeys().subscribe({
      next: (apiKeys) => {
        this.apiKeys.set(apiKeys);
      },
      error: () => {
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  public openApiKeyForm(apiKey?: ApiKey): void {
    this.dialogService.openApiKeyFormDialog(apiKey)?.onClose.subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  public deleteApiKey(apiKey: ApiKey): void {
    this.confirm.open({
      message: this.translateService.instant('apiKeys.form.deleteApiKeyConfirmation', {
        apiKeyName: apiKey.name,
      }),
      accept: () => {
        this.apiKeysService.deleteApiKey(apiKey.id).subscribe(() => this.loadData());
      },
    });
  }

  public toggleApiKeyStatus(apiKey: ApiKey): void {
    this.apiKeysService.toggleApiKeyStatus(apiKey.id).subscribe(() => {
      this.loadData();
    });
  }
}
