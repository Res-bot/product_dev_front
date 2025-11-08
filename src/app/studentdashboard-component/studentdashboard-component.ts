import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService, DashboardStats, CourseAttendance, ScheduleItem } from './studentservice';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './studentdashboard-component.html',
  styleUrls: ['./studentdashboard-component.scss']
})
export class StudentDashboardComponent implements OnInit {
  // User Information
  studentName = '';
  studentId = 0;
  email = '';
  department = '';
  currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Attendance Statistics
  attendancePercentage = 0;
  hoursAttended = 0;
  totalHours = 0;
  classesSkipped = 0;
  
  // Alerts
  lowAttendanceAlerts: string[] = [];
  showLowAttendanceWarning = false;
  
  // Loading & Error States
  isLoading = true;
  error: string | null = null;
  
  // Schedule
  todaySchedule: ScheduleItem[] = [];
  
  // Course Attendance
  courseAttendance: CourseAttendance[] = [];
  
  // Enrolled Courses
  enrolledCourses: any[] = [];

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 Initializing Student Dashboard');
    
    // Authentication Check
    if (!this.authService.isLoggedIn()) {
      console.log('❌ User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    const userRole = this.authService.getUserRole();
    if (userRole !== 'STUDENT') {
      console.log('❌ User is not a student, redirecting to appropriate dashboard');
      this.authService.navigateToDashboard();
      return;
    }

    // Set Student ID
    const studentId = this.authService.getCurrentUserId();
    if (studentId) {
      console.log('✅ Logged in as Student ID:', studentId);
      this.studentId = studentId;
      this.studentService.setDevStudentId(studentId);
    }

    // Set Student Name
    const userName = this.authService.getUserName();
    if (userName) {
      this.studentName = userName;
    }

    // Load All Dashboard Data
    this.loadAllData();
  }

  /**
   * Load all dashboard data
   */
  loadAllData(): void {
    this.isLoading = true;
    this.error = null;

    console.log('📊 Loading all dashboard data...');

    // Load data in parallel
    Promise.all([
      this.loadDashboardStats(),
      this.loadLowAttendanceAlerts(),
      this.loadTodaySchedule(),
      this.loadCourseAttendance(),
      this.loadEnrolledCourses()
    ]).then(() => {
      this.isLoading = false;
      console.log('✅ All dashboard data loaded successfully');
    }).catch((error) => {
      this.isLoading = false;
      this.error = 'Failed to load dashboard data. Please try again.';
      console.error('❌ Error loading dashboard data:', error);
    });
  }

  /**
   * GET /api/student/dashboard/stats
   * Load dashboard statistics
   */
  private loadDashboardStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📊 Loading dashboard stats...');

      this.studentService.getDashboardStats().subscribe({
        next: (stats: DashboardStats) => {
          console.log('✅ Dashboard stats loaded:', stats);
          
          this.studentName = stats.userName;
          this.attendancePercentage = Math.round(stats.attendancePercentage);
          this.hoursAttended = stats.presentCount;
          this.totalHours = stats.totalAttendanceRecords;
          this.classesSkipped = stats.absentCount;
          
          resolve();
        },
        error: (err: any) => {
          console.error('❌ Error loading dashboard stats:', err);
          this.studentName = this.authService.getUserName() || 'Student';
          reject(err);
        }
      });
    });
  }

  /**
   * GET /api/student/alerts/low-attendance
   * Load low attendance alerts
   */
  private loadLowAttendanceAlerts(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🚨 Loading attendance alerts...');
      
      this.studentService.getLowAttendanceAlerts().subscribe({
        next: (alerts: string[]) => {
          console.log('✅ Alerts loaded:', alerts);
          this.lowAttendanceAlerts = alerts;
          this.showLowAttendanceWarning = alerts.length > 0 || this.attendancePercentage < 85;
          resolve();
        },
        error: (err: any) => {
          console.error('❌ Error loading alerts:', err);
          this.showLowAttendanceWarning = false;
          resolve(); // Don't fail the entire dashboard
        }
      });
    });
  }

  /**
   * GET /api/student/schedule/today
   * ✅ FIXED: Now directly calls getTodaySchedule()
   */
  private loadTodaySchedule(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📅 Loading today\'s schedule...');
      
      this.studentService.getTodaySchedule().subscribe({
        next: (schedules: ScheduleItem[]) => {
          console.log('✅ Schedule loaded:', schedules);
          
          this.todaySchedule = schedules.map(schedule => ({
            id: schedule.id,
            subject: schedule.courseName || schedule.subject,
            courseCode: schedule.courseCode,
            teacher: schedule.teacherName || schedule.teacher,
            room: schedule.classroom || schedule.room || 'TBA',
            startTime: this.formatTime(schedule.startTime),
            endTime: this.formatTime(schedule.endTime),
            status: schedule.status || this.determineScheduleStatus(schedule.startTime, schedule.endTime),
            dayOfWeek: schedule.dayOfWeek,
            courseId: schedule.courseId,
            teacherId: schedule.teacherId
          }));
          
          resolve();
        },
        error: (err: any) => {
          console.error('❌ Error loading schedule:', err);
          this.todaySchedule = [];
          resolve(); // Don't fail the entire dashboard
        }
      });
    });
  }

  /**
   * Format time from HH:mm:ss to 12-hour format
   */
  private formatTime(time: string): string {
    if (!time || !time.includes(':')) {
      return time;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Determine schedule status based on current time
   */
  private determineScheduleStatus(startTime: string, endTime: string): 'completed' | 'ongoing' | 'upcoming' | 'pending' {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    if (currentMinutes < startTotalMinutes) {
      return 'upcoming';
    } else if (currentMinutes >= startTotalMinutes && currentMinutes <= endTotalMinutes) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  /**
   * GET /api/student/courses/attendance
   * Load course-wise attendance with details
   */
  private loadCourseAttendance(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📚 Loading course attendance...');
      
      this.studentService.getAllCourseAttendance().subscribe({
        next: (courses: CourseAttendance[]) => {
          console.log('✅ Course attendance loaded:', courses);
          this.courseAttendance = courses;
          resolve();
        },
        error: (err: any) => {
          console.error('❌ Error loading course attendance:', err);
          this.courseAttendance = [];
          resolve(); // Don't fail the entire dashboard
        }
      });
    });
  }

  /**
   * GET /api/student/courses/enrolled
   * Load enrolled courses with details
   */
  private loadEnrolledCourses(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📖 Loading enrolled courses...');
      
      this.studentService.getEnrolledCourses().subscribe({
        next: (courses: any[]) => {
          console.log('✅ Enrolled courses loaded:', courses);
          this.enrolledCourses = courses;
          resolve();
        },
        error: (err: any) => {
          console.error('❌ Error loading enrolled courses:', err);
          this.enrolledCourses = [];
          resolve(); // Don't fail the entire dashboard
        }
      });
    });
  }

  /**
   * POST /api/student/checkin
   * Student check-in for attendance
   */
  checkIn(): void {
    if (!confirm('Are you sure you want to check in?')) {
      return;
    }

    console.log('✓ Checking in...');
    
    this.studentService.checkIn().subscribe({
      next: (response: any) => {
        console.log('✅ Check-in successful:', response);
        alert('✅ Check-in successful! Attendance marked as PRESENT.');
        this.loadAllData(); // Reload dashboard data
      },
      error: (err: any) => {
        console.error('❌ Check-in failed:', err);
        alert('❌ Check-in failed: ' + (err.message || 'Please try again.'));
      }
    });
  }

  /**
   * Navigate to course enrollment page
   */
  navigateToCourseEnrollment(): void {
    console.log('📚 Navigating to course enrollment...');
    this.router.navigate(['/student/courses']);
  }

  /**
   * Navigate to attendance history page
   */
  viewAttendanceHistory(): void {
    console.log('📜 Navigating to attendance history...');
    this.router.navigate(['/student/attendance-history']);
  }

  /**
   * Navigate to profile page
   */
  viewProfile(): void {
    console.log('👤 Navigating to profile...');
    this.router.navigate(['/student/profile']);
  }

  /**
   * GET /api/student/attendance/percentage/{courseId}
   * Get attendance percentage for specific course
   */
  getAttendanceForCourse(courseId: number): void {
    console.log(`📊 Fetching attendance for course ${courseId}...`);
    
    this.studentService.getAttendancePercentage(courseId).subscribe({
      next: (percentage: number) => {
        console.log(`📊 Attendance for course ${courseId}: ${percentage}%`);
        alert(`Course Attendance: ${percentage}%`);
      },
      error: (err: any) => {
        console.error('❌ Error fetching attendance:', err);
        alert('Failed to fetch course attendance.');
      }
    });
  }

  /**
   * Get status class for schedule items
   */
  getStatusClass(status: string): string {
    return status?.toLowerCase() || 'pending';
  }

  /**
   * Get attendance color based on percentage
   */
  getAttendanceColor(): string {
    if (this.attendancePercentage >= 85) return '#10b981'; // Green
    if (this.attendancePercentage >= 75) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }

  /**
   * Format date string
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Logout
   */
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}