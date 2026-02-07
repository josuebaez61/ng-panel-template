import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor to add withCredentials: true to all HTTP requests
 * This is required for httpOnly cookies to be sent automatically
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request with withCredentials enabled
  const clonedReq = req.clone({
    withCredentials: true,
  });

  return next(clonedReq);
};
