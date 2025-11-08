import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './service/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip adding token for auth endpoints
  const isAuthEndpoint = req.url.includes('/api/auth/login') || 
                         req.url.includes('/api/auth/register');

  if (isAuthEndpoint) {
    console.log('⚪ Skipping token for auth endpoint:', req.url);
    return next(req);
  }

  // Add Authorization header with Bearer token for all other requests
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('🔑 Token attached to request:', req.url);
    console.log('📝 Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    
    return next(clonedRequest).pipe(
      catchError((error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
          console.error('❌ 401 Unauthorized - Token expired or invalid');
          authService.clearAuthData();
          router.navigate(['/login']);
        }
        
        // Handle 403 Forbidden - insufficient permissions
        if (error.status === 403) {
          console.error('⛔ 403 Forbidden - Insufficient permissions');
        }
        
        return throwError(() => error);
      })
    );
  }

  // No token available - shouldn't happen for protected routes
  console.warn('⚠️ No token available for request:', req.url);
  return next(req);
};