import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { GlobalProgressBarService } from '../services/loading/global-progress-bar-service';

export const globalLoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const globalProgressBarService = inject(GlobalProgressBarService);

  // Skip loading for retry requests (marked by auth interceptor)
  const skipLoading = req.headers.has('X-Skip-Loading');

  if (!skipLoading) {
    // Increment the active requests counter
    globalProgressBarService.incrementActiveRequests();

    // Show loading if this is the first active request
    if (globalProgressBarService.getActiveRequestsCount() === 1) {
      globalProgressBarService.setIsLoading(true);
    }
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        // Decrement the active requests counter
        globalProgressBarService.decrementActiveRequests();

        // Hide loading if no more active requests
        if (globalProgressBarService.getActiveRequestsCount() === 0) {
          globalProgressBarService.setIsLoading(false);
        }
      }
    })
  );
};
