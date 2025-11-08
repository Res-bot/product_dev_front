import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AddStudentModalComponent } from '../../Addmodal-components/add-student/add-student';
import { AddCourseModalComponent } from '../../Addmodal-components/add-course/add-course';
import { AddDepartmentModalComponent } from '../../Addmodal-components/add-department/add-department';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalEmployees: number;
  totalCourses: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    AddStudentModalComponent,
    AddCourseModalComponent,
    AddDepartmentModalComponent
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview implements OnInit {
  // Modal states
  isAddStudentModalOpen = false;
  isAddCourseModalOpen = false;
  isAddDepartmentModalOpen = false;

  // Dashboard data
  stats: DashboardStats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalEmployees: 0,
    totalCourses: 0
  };

  recentActivities: Activity[] = [];
  isLoading = false;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Fetch all data in parallel
    Promise.all([
      this.fetchUsers(),
      this.fetchCourses(),
      this.fetchRecentActivities()
    ]).then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  private fetchUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
        .subscribe({
          next: (users) => {
            // Count users by role
            this.stats.totalStudents = users.filter(u => u.role === 'STUDENT').length;
            this.stats.totalTeachers = users.filter(u => u.role === 'TEACHER').length;
            this.stats.totalEmployees = users.filter(u => u.role === 'EMPLOYEE').length;
            resolve();
          },
          error: (error) => {
            console.error('Error fetching users:', error);
            reject(error);
          }
        });
    });
  }

  private fetchCourses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`${this.apiUrl}/courses`, { headers: this.getHeaders() })
        .subscribe({
          next: (courses) => {
            this.stats.totalCourses = courses.length;
            resolve();
          },
          error: (error) => {
            console.error('Error fetching courses:', error);
            reject(error);
          }
        });
    });
  }

  private fetchRecentActivities(): Promise<void> {
    return new Promise((resolve) => {
      // If you have an activities endpoint, use it
      // For now, we'll create mock activities based on latest data
      this.http.get<any[]>(`${this.apiUrl}/users?limit=3`, { headers: this.getHeaders() })
        .subscribe({
          next: (users) => {
            this.recentActivities = users.slice(0, 3).map((user, index) => ({
              id: user.id,
              type: user.role,
              description: `${user.name} (${user.role}) - ${user.email}`,
              timestamp: this.getRelativeTime(index)
            }));
            resolve();
          },
          error: () => {
            // If activities fetch fails, use empty array
            this.recentActivities = [];
            resolve();
          }
        });
    });
  }

  private getRelativeTime(index: number): string {
    const times = ['2 minutes ago', '15 minutes ago', '1 hour ago', '2 hours ago'];
    return times[index] || 'Recently';
  }

  // Navigation methods
  onAddStudent(): void {
    this.router.navigate(['/admin/users']);
  }

  onAddcourse(): void {
    this.router.navigate(['/admin/courses']);
  }

  onAdddepartment(): void {
    this.router.navigate(['/admin/departments']);
  }

  onCloseModal(): void {
    this.isAddStudentModalOpen = false;
    this.isAddCourseModalOpen = false;
    this.isAddDepartmentModalOpen = false;
  }

  onSubmitStudent(newStudent: any): void {
    console.log("Student submitted:", newStudent);
    this.onCloseModal();
    this.loadDashboardData();
  }

  onSubmitCourse(courseData: any): void {
    console.log("Course submitted:", courseData);
    this.onCloseModal();
    this.loadDashboardData();
  }

  onSubmitDepartment(departmentData: any): void {
    console.log("Department submitted:", departmentData);
    this.onCloseModal();
    this.loadDashboardData();
  }
}