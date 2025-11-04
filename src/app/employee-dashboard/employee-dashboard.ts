import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// Interfaces
export interface LeaveRequest {
  id?: number;
  userId?: number;
  employeeId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
  status: string;
  requestedOn?: string;
  rejectionReason?: string;
}

export interface LeaveRequestDTO {
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
}

export interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  phone?: string;
  role: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  
  // API URLs
  private backendUrl = 'http://localhost:8080/api/employee';
  
  // Active Tab
  activeTab: 'leave' | 'profile' = 'leave';
  
  // Leave Management
  leaveForm = {
    startDate: '',
    endDate: '',
    reason: '',
    type: 'SICK'
  };
  leaveHistory: LeaveRequest[] = [];
  
  // Profile
  employeeProfile: EmployeeProfile = {
    id: 0,
    name: 'Loading...',
    email: 'Loading...',
    role: 'EMPLOYEE'
  };
  
  // Loading states
  isLoading = false;
  isLoadingProfile = false;
  
  // Messages
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployeeProfile();
    this.loadLeaveHistory();
  }

  // ============ UTILITY METHODS ============
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ============ TAB SWITCHING ============
  
  switchTab(tab: 'leave' | 'profile'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ============ PROFILE METHODS ============
  
  loadEmployeeProfile(): void {
    this.isLoadingProfile = true;
    
    // Try to get from localStorage first
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.employeeProfile = {
          id: user.userId || 0,
          name: user.userName || 'Employee',
          email: user.email || '',
          role: user.role || 'EMPLOYEE',
          employeeId: user.employeeId || 'N/A',
          department: user.department || 'N/A',
          position: user.position || 'N/A',
          joinDate: user.joinDate || 'N/A',
          phone: user.phone || 'N/A'
        };
        this.isLoadingProfile = false;
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fallback: fetch from API
    this.http.get<any>(`${this.backendUrl}/profile`, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(error => {
          console.error('Error loading profile:', error);
          return of({
            id: 0,
            name: 'Employee',
            email: 'N/A',
            role: 'EMPLOYEE'
          });
        }),
        finalize(() => {
          this.isLoadingProfile = false;
        })
      )
      .subscribe((profile: any) => {
        this.employeeProfile = profile;
      });
  }

  // ============ LEAVE MANAGEMENT METHODS ============
  
  loadLeaveHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<LeaveRequest[]>(`${this.backendUrl}/leave/history`, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(error => {
          console.error('Error loading leave history:', error);
          this.errorMessage = 'Failed to load leave history. Please ensure you are logged in.';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((history: LeaveRequest[]) => {
        this.leaveHistory = history.sort((a, b) => 
          (b.requestedOn ? new Date(b.requestedOn).getTime() : 0) - 
          (a.requestedOn ? new Date(a.requestedOn).getTime() : 0)
        );
      });
  }

  applyLeave(): void {
    if (!this.leaveForm.startDate || !this.leaveForm.endDate || !this.leaveForm.reason) {
      this.errorMessage = 'Please fill all required fields (*).';
      this.successMessage = '';
      return;
    }
    
    if (new Date(this.leaveForm.endDate) < new Date(this.leaveForm.startDate)) {
      this.errorMessage = 'End date cannot be before start date.';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const leaveData: LeaveRequestDTO = {
      startDate: this.leaveForm.startDate,
      endDate: this.leaveForm.endDate,
      reason: this.leaveForm.reason,
      type: this.leaveForm.type
    };

    this.http.post<LeaveRequest>(`${this.backendUrl}/leave/apply`, leaveData, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(error => {
          console.error('Error applying for leave:', error);
          this.errorMessage = error.error?.message || 'Failed to submit leave application. Please try again.';
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((newLeave: LeaveRequest) => {
        this.leaveHistory.unshift(newLeave);
        this.successMessage = 'Leave application submitted successfully!';
        this.resetForm();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      });
  }

  resetForm(): void {
    this.leaveForm = {
      startDate: '',
      endDate: '',
      reason: '',
      type: 'SICK'
    };
    this.errorMessage = '';
  }

  refreshLeaveHistory(): void {
    this.loadLeaveHistory();
  }

  // ============ DISPLAY HELPERS ============
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  calculateDuration(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getStatusBadgeClass(status: string): string {
    if (!status) return 'status-pending';
    
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getStatusDisplayText(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getLeaveTypeDisplay(type: string): string {
    if (!type) return 'N/A';
    
    switch(type.toUpperCase()) {
      case 'SICK': return 'Sick Leave';
      case 'CASUAL': return 'Casual Leave';
      case 'ANNUAL': return 'Annual Leave';
      case 'VACATION': return 'Vacation';
      case 'PERSONAL': return 'Personal';
      case 'EMERGENCY': return 'Emergency';
      default: return type;
    }
  }

  getPendingCount(): number {
    return this.leaveHistory.filter(leave => 
      leave.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  getApprovedCount(): number {
    return this.leaveHistory.filter(leave => 
      leave.status?.toUpperCase() === 'APPROVED'
    ).length;
  }

  getRejectedCount(): number {
    return this.leaveHistory.filter(leave => 
      leave.status?.toUpperCase() === 'REJECTED'
    ).length;
  }

  // ============ LOGOUT ============
  
  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      this.router.navigate(['/login']);
    }
  }
}