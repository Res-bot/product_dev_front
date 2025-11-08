import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface DashboardStats {
  userName: string;
  role: string;
  totalAttendanceRecords: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseName: string;
  courseCode: string;
  markedByTeacherId: number;
  markedByTeacherName: string;
  checkInTime: string;
  attendanceDate: string;
  status: string;
  present: boolean;
}

export interface CourseAttendance {
  courseId: number;
  courseName: string;
  courseCode: string;
  attendancePercentage: number;
  presentCount: number;
  absentCount: number;
  totalClasses: number;
  credits?: number;
  teacherName?: string;
}

export interface EnrolledCourse {
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  description: string;
  teacherId?: number;
  teacherName?: string;
  teacherEmail?: string;
  departmentId?: number;
  departmentName?: string;
  attendancePercentage?: number;
}

export interface StudentProfile {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  department: string;
  designation: string;
  role: string;
  studentId: string;
  enrolledCoursesCount: number;
  overallAttendance: number;
  totalClassesAttended: number;
  totalClassesMissed: number;
}

export interface ScheduleItem {
  id: number;
  subject: string;
  courseCode: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'ongoing' | 'upcoming' | 'pending';
  dayOfWeek: string;
  courseId: number;
  teacherId: number;
  courseName?: string;
  teacherName?: string;
  classroom?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/api/student';

  constructor(private http: HttpClient) {
    console.log('✅ StudentService initialized');
  }

  /**
   * GET /api/student/dashboard/stats
   * Get comprehensive dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/alerts/low-attendance
   * Get low attendance alerts (courses below 75%)
   */
  getLowAttendanceAlerts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/alerts/low-attendance`)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST /api/student/checkin
   * Check in - mark attendance as present
   */
  checkIn(): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}/checkin`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/attendance/percentage/{courseId}
   * Get attendance percentage for a specific course
   */
  getAttendancePercentage(courseId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/attendance/percentage/${courseId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/courses/attendance
   * Get attendance for all enrolled courses WITH DETAILS
   */
  getAllCourseAttendance(): Observable<CourseAttendance[]> {
    return this.http.get<CourseAttendance[]>(`${this.baseUrl}/courses/attendance`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/schedule/today
   * Get today's class schedule/timetable
   * ✅ FIXED: Now calls the correct endpoint
   */
  getTodaySchedule(): Observable<ScheduleItem[]> {
    console.log('📅 Calling GET /api/student/schedule/today');
    return this.http.get<ScheduleItem[]>(`${this.baseUrl}/schedule/today`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/schedules/day/{day}
   * Get student's schedule for a specific day
   * ✅ REMOVED FALLBACK - This will be implemented later
   */
  getScheduleByDay(day: string, studentId: number): Observable<ScheduleItem[]> {
    console.log(`⚠️ schedules/day/${day} endpoint not implemented yet`);
    // For now, just return today's schedule
    return this.getTodaySchedule();
  }

  /**
   * GET /api/student/schedules
   * Get all schedules for the student
   * ✅ REMOVED FALLBACK - This will be implemented later
   */
  getAllSchedules(studentId: number): Observable<ScheduleItem[]> {
    console.warn('⚠️ schedules endpoint not implemented yet');
    return this.getTodaySchedule();
  }

  /**
   * GET /api/student/attendance/history
   * Get attendance history for a date range
   */
  getAttendanceHistory(startDate?: string, endDate?: string): Observable<AttendanceRecord[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/attendance/history`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/profile
   * Get student profile information
   */
  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.baseUrl}/profile`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/student/courses/enrolled
   * Get all enrolled courses with details
   */
  getEnrolledCourses(): Observable<EnrolledCourse[]> {
    return this.http.get<EnrolledCourse[]>(`${this.baseUrl}/courses/enrolled`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error.';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // Legacy method for backward compatibility
  setDevStudentId(studentId: number): void {
    console.log('📝 Student ID set to:', studentId);
  }
}