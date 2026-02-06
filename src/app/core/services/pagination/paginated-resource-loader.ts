import { computed, signal } from '@angular/core';
import { ApiPaginationResponse, PaginationRequest } from '@core/models';
import { TableLazyLoadEvent } from 'primeng/table';
import { BehaviorSubject, Observable, catchError, finalize, tap } from 'rxjs';

export interface PaginatedResourceLoaderOptions<T> {
  page?: number;
  pageSize?: number;
  infiniteScroll?: boolean;
  defaultFilters?: Record<string, string | boolean | number | null>;
  fetchData(request: PaginationRequest): Observable<ApiPaginationResponse<T>>;
}

export class PaginatedResourceLoader<T> {
  private _items = signal<T[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _totalCount = signal<number>(0);
  private _totalPages = signal<number>(0);
  private _currentPage = signal<number>(1);
  private _pageSize = signal<number>(10);
  private _hasNextPage = signal<boolean>(false);
  private _hasPreviousPage = signal<boolean>(false);
  private _sortBy = signal<string>('');
  private _sortDirection = signal<'asc' | 'desc'>('asc');
  private _filters = signal<Record<string, string | boolean | number | null>>({});
  private _itemsSubject = new BehaviorSubject<T[]>([]);

  public items = this._items.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();
  public totalCount = this._totalCount.asReadonly();
  public totalPages = this._totalPages.asReadonly();
  public currentPage = this._currentPage.asReadonly();
  public pageSize = this._pageSize.asReadonly();
  public hasNextPage = this._hasNextPage.asReadonly();
  public hasPreviousPage = this._hasPreviousPage.asReadonly();
  public globalSearch = computed(() => (this._filters()['globalSearch'] || '').toString());
  public sortBy = this._sortBy.asReadonly();
  public sortDirection = this._sortDirection.asReadonly();
  public filters = this._filters.asReadonly();
  public pageIndex = computed(() => this.currentPage() - 1);
  public items$ = this._itemsSubject.asObservable();

  private infiniteScroll = false;
  private defaultFilters: Record<string, string | boolean | number | null> = {};
  protected fetchData: (request: PaginationRequest) => Observable<ApiPaginationResponse<T>>;

  public filtersApplied = computed(
    () =>
      (Object.keys(this.filters()).length > 0 || this.globalSearch() !== '') &&
      Object.keys(this.filters()).some((key) => this.filters()[key] !== this.defaultFilters[key])
  );

  constructor(options: PaginatedResourceLoaderOptions<T>) {
    this._currentPage.set(options.page || 1);
    this._pageSize.set(options.pageSize || 10);
    this.infiniteScroll = options.infiniteScroll || false;
    this.defaultFilters = options.defaultFilters || {};
    this._filters.set({ ...this.defaultFilters });
    this.fetchData = options.fetchData;

    // Initialize BehaviorSubject with empty array
    this._itemsSubject.next([]);
  }

  public clearFilters(): void {
    this._filters.set({ ...this.defaultFilters });
    this.clearItems();
    this.loadData(1);
  }

  public applyGlobalSearch(value: string): void {
    this.applyFilter('globalSearch', value);
  }

  public applyFilter(key: string, value: string | boolean | number | null): void {
    this._filters.set({ ...this._filters(), [key]: value });
    this.clearItems();
    this.loadData(1);
  }

  private clearItems(): void {
    this._items.set([]);
    this._itemsSubject.next([]);
  }

  /**
   * Build pagination request object
   */
  private buildRequest(): PaginationRequest {
    return {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      globalSearch: this.globalSearch() || undefined,
      sortBy: this.sortBy() || undefined,
      sortDirection: this.sortDirection(),
      filters: this.filters(),
    };
  }

  public refresh(): void {
    this.loadData();
  }

  /**
   * Get current items value from BehaviorSubject
   */
  public getCurrentItems(): T[] {
    return this._itemsSubject.value;
  }

  public loadNextPage(): void {
    if (this.hasNextPage()) {
      this._currentPage.set(this.currentPage() + 1);
      this.loadData();
    }
  }

  public loadPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this._currentPage.set(this.currentPage() - 1);
      this.loadData();
    }
  }

  public handleTableLazyLoadEvent(event: TableLazyLoadEvent): void {
    if (typeof event.first === 'number' && typeof event.rows === 'number') {
      this._currentPage.set(event.first === 0 ? 1 : event.first / event.rows + 1);
      this._pageSize.set(event.rows);
    }

    if (typeof event.globalFilter === 'string') {
      this._filters.set({ ...this.filters(), globalSearch: event.globalFilter });
      this._currentPage.set(1);
    } else {
      this._filters.set({ ...this.filters(), globalSearch: '' });
    }

    const sortField = event.sortField;

    if (typeof sortField === 'string') {
      this._sortBy.set(sortField);
      this._sortDirection.set(event.sortOrder === 1 ? 'asc' : 'desc');
    } else {
      this._sortBy.set('');
      this._sortDirection.set('asc');
    }

    this.loadData();
  }

  /**
   * Load data with current pagination settings
   */
  public loadData(page?: number, pageSize?: number): void {
    if (page) this._currentPage.set(page);
    if (pageSize) this._pageSize.set(pageSize);

    this._loading.set(true);
    this._error.set(null);

    const request: PaginationRequest = this.buildRequest();

    this.fetchData(request)
      .pipe(
        tap((response) => this.handleSuccess(response)),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  /**
   * Handle successful API response
   */
  private handleSuccess(response: ApiPaginationResponse<T>): void {
    if (response.success && response.data) {
      const { items, metadata } = response.data;

      this.updateItems(items);
      this._totalCount.set(metadata.totalCount);
      this._totalPages.set(metadata.totalPages);
      this._hasNextPage.set(metadata.hasNextPage);
      this._hasPreviousPage.set(metadata.hasPreviousPage);
      this._currentPage.set(metadata.currentPage);
      this._pageSize.set(metadata.pageSize);

      this._error.set(null);
    } else {
      this.handleError(new Error(response.error?.message || 'Unknown error'));
    }
  }

  private updateItems(items: T[]): void {
    const newItems = this.infiniteScroll ? [...this._items(), ...items] : items;
    this._items.set(newItems);
    this._itemsSubject.next(newItems);
  }

  /**
   * Handle API error
   */
  private handleError(error: any): Observable<never> {
    const errorMessage = error?.message || error?.error?.message || 'An error occurred';
    this._error.set(errorMessage);
    this._loading.set(false);
    throw error;
  }
}
