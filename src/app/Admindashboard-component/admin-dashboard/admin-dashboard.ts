import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  phoneno?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'overview';
  adminUser: AdminUser | null = null;
  isLoadingUser = false;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    // Listen to route changes to update active tab
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTab();
    });
    
    this.updateActiveTab();
  }

  ngOnInit(): void {
    this.loadAdminUser();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private loadAdminUser(): void {
    this.isLoadingUser = true;
    
    this.http.get<AdminUser>(`${this.apiUrl}/me`, { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          console.log('User loaded successfully:', user);
          this.adminUser = user;
          this.isLoadingUser = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching admin user:', error);
          this.isLoadingUser = false;
          
          // Fallback: Get user from localStorage
          const userData = localStorage.getItem('user_data');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              this.adminUser = {
                id: user.userId,
                name: user.userName,
                email: user.email,
                role: user.role
              };
              console.log('Loaded user from localStorage:', this.adminUser);
            } catch (e) {
              console.error('Error parsing user data:', e);
              this.setDefaultAdminUser();
            }
          } else {
            this.setDefaultAdminUser();
          }
          this.cdr.detectChanges();
        }
      });
  }

  private setDefaultAdminUser(): void {
    this.adminUser = { 
      id: 0, 
      name: 'Admin User', 
      email: '', 
      role: 'ADMIN' 
    };
  }

  private updateActiveTab(): void {
    const url = this.router.url;
    
    if (url.includes('/overview')) {
      this.activeTab = 'overview';
    } else if (url.includes('/users')) {
      this.activeTab = 'users';
    } else if (url.includes('/courses')) {
      this.activeTab = 'courses';
    } else if (url.includes('/departments')) {
      this.activeTab = 'departments';
    } else if (url.includes('/schedules')) {
    this.activeTab = 'schedules';  
    } else {
      this.activeTab = 'overview';
    }
  }

  setActiveTab(tab: string): void {
    this.router.navigate(['/admin', tab]);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      this.router.navigate(['/login']);
    }
  }
}