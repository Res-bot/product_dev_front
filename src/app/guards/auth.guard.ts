import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 AuthGuard: Checking authentication for:', state.url);
  
  // First, check if token exists
  const token = authService.getToken();
  if (!token) {
    console.log('❌ AuthGuard: No token found, redirecting to login');
    authService.clearAuthData();
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  // Check if user data exists
  const userData = authService.getCurrentUser();
  if (!userData) {
    console.log('❌ AuthGuard: No user data found, redirecting to login');
    authService.clearAuthData();
    router.navigate(['/login']);
    return false;
  }

  console.log('✅ AuthGuard: User is authenticated');
  
  // Check if route requires specific roles
  const requiredRoles = route.data['roles'] as string[];
  
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.getUserRole();
    console.log('🔑 AuthGuard: Required roles:', requiredRoles);
    console.log('👤 AuthGuard: User role:', userRole);
    
    if (!userRole) {
      console.log('❌ AuthGuard: No user role found');
      authService.clearAuthData();
      router.navigate(['/login']);
      return false;
    }

    // Check if user's role matches any of the required roles (case-insensitive)
    const hasAccess = requiredRoles.some(
      role => role.toUpperCase() === userRole.toUpperCase()
    );

    if (!hasAccess) {
      console.log('⛔ AuthGuard: Access denied - insufficient permissions');
      alert('You do not have permission to access this page');
      
      // Redirect to appropriate dashboard
      authService.navigateToDashboard();
      return false;
    }
  }

  console.log('✅ AuthGuard: Access granted');
  return true;
};