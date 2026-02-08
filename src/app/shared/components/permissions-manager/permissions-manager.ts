import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ResourcePermissions } from '@core/models';
import { PermissionsApi } from '@core/services';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, tap } from 'rxjs';
import { PanelModule } from 'primeng/panel';
import { PermissionsManagerConfig } from './permissions-manager-config';
import { UnsavedChangesDialog } from '@shared/components/dialogs/unsaved-changes-dialog/unsaved-changes-dialog';
import { UnsavedChangesService } from '@core/services';

@Component({
  selector: 'app-permissions-manager',
  imports: [CheckboxModule, TranslateModule, FormsModule, PanelModule, UnsavedChangesDialog],
  templateUrl: './permissions-manager.html',
  styleUrl: './permissions-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsManager<T> implements OnInit {
  private readonly permissionsApi = inject(PermissionsApi);
  private readonly unsavedChangesService = inject(UnsavedChangesService);

  public config = input.required<PermissionsManagerConfig<T>>();
  public entity = signal<T | null>(null);
  public resources = signal<ResourcePermissions[]>([]);
  public selectedPermissions = signal<string[]>([]);
  public loading = signal(false);
  public error = signal<unknown>(null);

  public entityLoaded = output<T>();
  public permissionsSaved = output<T>();

  // Keep initial/saved state for reset functionality
  private savedPermissions: string[] = [];

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    const config = this.config();
    this.loading.set(true);
    this.error.set(null);

    const getResourcesPermissions = config.getResourcesPermissions
      ? config.getResourcesPermissions()
      : this.permissionsApi.getAllResourcesPermissions();

    forkJoin([
      config.getEntity(config.entityId),
      config.getPermissions(config.entityId),
      getResourcesPermissions,
    ]).subscribe({
      next: ([entity, permissions, resources]) => {
        this.entity.set(entity);
        this.entityLoaded.emit(entity);
        const permissionIds = permissions.map((p) => p.id);
        this.resources.set(
          resources.filter((r) => r.permissions.length > 0).sort((a, b) => a.order - b.order)
        );
        this.selectedPermissions.set([...permissionIds]);

        // Save initial state as "saved" state
        this.savedPermissions = [...permissionIds];
      },
      complete: () => {
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error);
      },
    });
  }

  /**
   * Handles individual checkbox change
   */
  public onPermissionToggle(permissionId: string, checked: boolean): void {
    const currentSelection = [...this.selectedPermissions()];

    if (checked) {
      if (!currentSelection.includes(permissionId)) {
        currentSelection.push(permissionId);
      }
    } else {
      const index = currentSelection.indexOf(permissionId);
      if (index > -1) {
        currentSelection.splice(index, 1);
      }
    }

    this.selectedPermissions.set(currentSelection);
    this.updateUnsavedChangesState();
  }

  /**
   * Gets the current array of selected permission IDs
   */
  public getSelectedPermissionIds(): string[] {
    return this.selectedPermissions();
  }

  /**
   * Checks if a specific permission is selected
   */
  public isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissions().includes(permissionId);
  }

  /**
   * Selects or deselects all permissions of a specific resource
   */
  public toggleResourcePermissions(
    resourcePermissions: ResourcePermissions,
    selectAll: boolean
  ): void {
    const currentSelection = [...this.selectedPermissions()];
    const resourcePermissionIds = resourcePermissions.permissions.map((p) => p.id);

    if (selectAll) {
      resourcePermissionIds.forEach((id) => {
        if (!currentSelection.includes(id)) {
          currentSelection.push(id);
        }
      });
    } else {
      resourcePermissionIds.forEach((id) => {
        const index = currentSelection.indexOf(id);
        if (index > -1) {
          currentSelection.splice(index, 1);
        }
      });
    }

    this.selectedPermissions.set(currentSelection);
    this.updateUnsavedChangesState();
  }

  /**
   * Checks if all permissions of a resource are selected
   */
  public areAllResourcePermissionsSelected(resourcePermissions: ResourcePermissions): boolean {
    return resourcePermissions.permissions.every((p) => this.isPermissionSelected(p.id));
  }

  /**
   * Checks if any permission of a resource is selected
   */
  public isSomeResourcePermissionSelected(resourcePermissions: ResourcePermissions): boolean {
    return resourcePermissions.permissions.some((p) => this.isPermissionSelected(p.id));
  }

  /**
   * Saves the selected permissions
   */
  public savePermissions(): void {
    const config = this.config();
    const selectedIds = [...this.selectedPermissions()];
    config
      .updatePermissions(config.entityId, selectedIds)
      .pipe(
        tap((entity) => {
          this.savedPermissions = [...selectedIds];
          this.unsavedChangesService.markSavedChanges();
          this.permissionsSaved.emit(entity);
        })
      )
      .subscribe();
  }

  /**
   * Resets selected permissions to the last saved state
   */
  public resetPermissions(): Promise<boolean> {
    // Restore selection to saved state
    this.selectedPermissions.set([...this.savedPermissions]);

    // Reset unsaved changes state
    this.unsavedChangesService.markSavedChanges();
    return Promise.resolve(true);
  }

  /**
   * Checks if there are unsaved changes
   */
  public hasUnsavedChanges(): boolean {
    const current = this.getSelectedPermissionIds().sort();
    const saved = [...this.savedPermissions].sort();

    if (current.length !== saved.length) {
      return true;
    }

    return current.some((id, index) => id !== saved[index]);
  }

  /**
   * Converts snake_case to camelCase
   */
  public toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Updates the unsaved changes state
   */
  private updateUnsavedChangesState(): void {
    const hasChanges = this.hasUnsavedChanges();

    if (hasChanges) {
      this.unsavedChangesService.markUnsavedChanges();
    } else {
      this.unsavedChangesService.markSavedChanges();
    }
  }
}
