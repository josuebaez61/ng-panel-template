import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { GlobalLoadingService } from '../services/loading/global-loading-service';

export const globalLoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const globalLoadingService = inject(GlobalLoadingService);

  // Skip loading for retry requests (marked by auth interceptor)
  const skipLoading = req.headers.has('X-Skip-Loading');

  if (!skipLoading) {
    // Increment the active requests counter
    globalLoadingService.incrementActiveRequests();

    // Show loading if this is the first active request
    if (globalLoadingService.getActiveRequestsCount() === 1) {
      globalLoadingService.setIsLoading(true);
    }
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        // Decrement the active requests counter
        globalLoadingService.decrementActiveRequests();

        // Hide loading if no more active requests
        if (globalLoadingService.getActiveRequestsCount() === 0) {
          globalLoadingService.setIsLoading(false);
        }
      }
    })
  );
};
