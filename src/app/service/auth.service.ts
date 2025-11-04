import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, BehaviorSubject, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface AuthRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  jwtToken: string;
  email: string;
  role: string;
  userId: number;
  userName: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Initialize currentUserSubject only if valid data exists
    const user = this.getCurrentUser();
    if (user && this.getToken()) {
      this.currentUserSubject.next(user);
    }
  }

  private getStorage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login response received:', response);
        this.setAuthData(response);
        this.currentUserSubject.next(response);
        console.log('💾 Auth data stored in localStorage');
      }),
      catchError((error: any) => {
        console.error('❌ Login error:', error);
        return throwError(() => error);
      })
    );
  }
  
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        console.log('✅ Registration successful:', response);
      }),
      catchError((error: any) => {
        console.error('❌ Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('🚪 Logging out user');
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  clearAuthData(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
      console.log('🗑️ Cleared auth data from localStorage');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.TOKEN_KEY) : null;
  }

  getCurrentUser(): AuthResponse | null {
    const storage = this.getStorage();
    if (!storage) return null;
    
    try {
      const userData = storage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error: any) {
      console.error('❌ Error parsing user data:', error);
      this.clearAuthData();
      return null;
    }
  }
  getCurrentUserId(): number | null {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId, 10) : null;
}

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getUserName(): string | null {
    const user = this.getCurrentUser();
    return user ? user.userName : null;
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.userId : null;
  }

  getUserData(): AuthResponse | null {
    return this.getCurrentUser();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const isValid = !!(token && user && user.userId);
    
    if (!isValid) {
      console.log('⚠️ Invalid auth state - clearing data');
      this.clearAuthData();
    }
    
    return isValid;
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole?.toUpperCase() === role.toUpperCase();
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole()?.toUpperCase();
    return roles.some(role => role.toUpperCase() === userRole);
  }

  private setAuthData(response: AuthResponse): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.TOKEN_KEY, response.jwtToken);
      storage.setItem(this.USER_KEY, JSON.stringify(response));
      console.log('💾 Stored token and user data');
    }
  }

  navigateToDashboard(): void {
    const role = this.getUserRole();
    
    if (!role) {
      console.error('❌ No role found, redirecting to login');
      this.clearAuthData();
      this.router.navigate(['/login']);
      return;
    }

    console.log('🚀 Navigating to dashboard for role:', role);

    // Normalize role to uppercase for comparison
    const normalizedRole = role.toUpperCase();

    switch(normalizedRole) {
      case 'ADMIN':
        console.log('➡️ Navigating to /admin/overview');
        this.router.navigate(['/admin/overview']);
        break;
      
      case 'FACULTY':
      case 'TEACHER':
        console.log('➡️ Navigating to /faculty (Teacher Dashboard)');
        // Navigate directly to /faculty since it's a single component without children
        this.router.navigate(['/faculty']);
        break;
      
      case 'STUDENT':
        console.log('➡️ Navigating to /student/dashboard');
        this.router.navigate(['/student/dashboard']);
        break;
      
      case 'EMPLOYEE':
        console.log('➡️ Navigating to /employee');
        this.router.navigate(['/employee']);
        break;
      
      default:
        console.warn('⚠️ Unknown role:', role);
        alert(`Unknown user role: ${role}. Please contact administrator.`);
        this.clearAuthData();
        this.router.navigate(['/login']);
    }
  }
}