import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

// ==================== INTERFACES ====================

interface Student {
  id: number;
  name: string;
  email: string;
  present: boolean;
  notes?: string;
}

interface Subject {
  id: number;
  name: string;
  courseCode?: string;
}

interface LeaveRequest {
  id: number;
  teacherId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate?: string;
}

interface PendingLeaveApproval {
  id: number;
  userId: number;
  userName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate?: string;
}

interface EmployeeLeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate?: string;
}

interface AttendanceSubmission {
  courseId: number;
  attendanceDate: string;
  session: string; // NEW: Add session field
  studentAttendances: {
    studentId: number;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    notes: string;
  }[];
}

interface AbsentStudent {
  id: number;
  name: string;
  email: string;
  studentId?: string;
}

interface SessionTime {
  name: string;
  displayName: string;
  timeRange: string;
}

interface Schedule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  batch?: string;
  notes?: string;
  courseId: number;
  courseName: string;
  courseCode?: string;
  teacherId: number;
  teacherName: string;
  departmentId?: number;
  departmentName?: string;
}

// ==================== COMPONENT ====================

@Component({
  standalone: true,
  selector: 'app-teacher-dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './teacherdashboard-component.html',
  styleUrls: ['./teacherdashboard-component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  
  // ==================== USER INFO ====================
  teacherId: number = 0;
  teacherName: string = '';
  userEmail: string = '';
  userRole: string = 'TEACHER';

  // ==================== NAVIGATION ====================
  activeView: 'overview' | 'attendance' | 'leave' | 'leave-status' | 'approve-teacher-leaves' | 'approve-employee-leaves' | 'absent-students' | 'schedules' = 'overview';  // ==================== OVERVIEW DATA ====================
  subjects: Subject[] = [];
  totalSubjects: number = 0;
  pendingLeaves: number = 0;
  approvedLeaves: number = 0;
  currentMonth = new Date().toLocaleString('default', { month: 'long' });
  currentDay = new Date().getDate();
  currentYear = new Date().getFullYear();

  // ==================== SCHEDULE DATA ====================
  schedules: Schedule[] = [];
  weeklySchedules: { [key: string]: Schedule[] } = {};
  selectedDay: string = '';
  isLoadingSchedules: boolean = false;
  daysOfWeek: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  todaySchedules: Schedule[] = [];

  // ==================== ATTENDANCE DATA ====================
  students: Student[] = [];
  selectedSubjectId: number = 0;
  attendanceDate: string = new Date().toISOString().split('T')[0];
  isLoadingStudents: boolean = false;

  selectedSession: string = '';
  availableSessions: SessionTime[] = [
    { name: 'SESSION_9_10', displayName: 'Session 9:00 - 10:00', timeRange: '09:00-10:00' },
    { name: 'SESSION_10_11', displayName: 'Session 10:00 - 11:00', timeRange: '10:00-11:00' },
    { name: 'SESSION_11_12', displayName: 'Session 11:00 - 12:00', timeRange: '11:00-12:00' },
    { name: 'SESSION_12_1', displayName: 'Session 12:00 - 13:00', timeRange: '12:00-13:00' },
    { name: 'SESSION_1_2', displayName: 'Session 13:00 - 14:00', timeRange: '13:00-14:00' },
    { name: 'SESSION_2_3', displayName: 'Session 14:00 - 15:00', timeRange: '14:00-15:00' },
    { name: 'SESSION_3_4', displayName: 'Session 15:00 - 16:00', timeRange: '15:00-16:00' },
    { name: 'SESSION_4_5', displayName: 'Session 16:00 - 17:00', timeRange: '16:00-17:00' },
    { name: 'SESSION_5_6', displayName: 'Session 17:00 - 18:00', timeRange: '17:00-18:00' }
  ];



  isUpdatingAttendance: boolean = false;
  existingAttendanceId: number | null = null;



  // ==================== ABSENT STUDENTS EMAIL ====================
  absentStudents: AbsentStudent[] = [];
  isLoadingAbsentStudents: boolean = false;
  isSendingEmails: boolean = false;
  lastMarkedCourseId: number = 0;
  lastMarkedDate: string = '';
  selectedAbsentStudentIds: number[] = [];

  // ==================== LEAVE APPLICATION DATA ====================
  leaveData = {
    teacherId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  };
  minDate: string = new Date().toISOString().split('T')[0];

  // ==================== LEAVE STATUS DATA ====================
  myLeaves: LeaveRequest[] = [];
  isLoadingLeaves: boolean = false;

  // Teacher Leave Approvals
  teacherPendingLeaves: PendingLeaveApproval[] = [];
  isLoadingTeacherLeaves: boolean = false;

  // Employee Leave Approvals  
  employeePendingLeaves: EmployeeLeaveRequest[] = [];
  isLoadingEmployeeLeaves: boolean = false;

  // ==================== UI STATES ====================
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // ==================== CONFIGURATION ====================
  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly MAX_ATTENDANCE_AGE_DAYS = 7;

  // ==================== CONSTRUCTOR ====================
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  // ==================== LIFECYCLE HOOKS ====================
  ngOnInit(): void {
    this.initializeTeacherData();
  }

  // ==================== INITIALIZATION ====================

  private initializeTeacherData(): void {
    const userData = this.authService.getCurrentUser();
    
    if (!userData) {
      this.showError('User data not found. Please login again.');
      this.redirectToLogin(2000);
      return;
    }

    this.teacherId = userData.userId;
    this.teacherName = userData.userName;
    this.userEmail = userData.email || '';
    this.leaveData.teacherId = userData.userId;
    
    this.loadOverviewData();
  }

  // ==================== NAVIGATION METHODS ====================

navigateTo(view: 'overview' | 'attendance' | 'leave' | 'leave-status' | 'approve-teacher-leaves' | 'approve-employee-leaves' | 'absent-students' | 'schedules'): void {
  this.activeView = view;
  this.clearMessages();
  
  switch(view) {
    case 'overview':
      this.loadOverviewData();
      break;
    
    case 'attendance':
      this.initializeAttendanceView();
      break;
    
    case 'leave-status':
      this.loadMyLeaves();
      break;
    
    case 'approve-teacher-leaves':
      this.loadTeacherPendingLeaves();
      break;
    
    case 'approve-employee-leaves':
      this.loadEmployeePendingLeaves();
      break;
    
    case 'absent-students':
      break;
    
    case 'schedules':
      this.loadTeacherSchedules();
      break;
  }
}

  private initializeAttendanceView(): void {
    if (this.subjects.length === 0) {
      this.loadSubjects();
    }
    
    if (this.subjects.length > 0 && !this.selectedSubjectId) {
      this.selectedSubjectId = this.subjects[0].id;
      this.loadStudents();
    }
  }



  // ==================== OVERVIEW METHODS ====================

  loadOverviewData(): void {
    this.loadSubjects();
    this.loadLeaveStats();
  }

  loadSubjects(): void {
    const url = `${this.baseUrl}/courses/teacher/${this.teacherId}`;
    const headers = this.getAuthHeaders();
    
    this.http.get<Subject[]>(url, { headers }).subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.totalSubjects = subjects.length;
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
        this.handleError(err, 'Failed to load subjects');
      }
    });
  }

  loadLeaveStats(): void {
    const url = `${this.baseUrl}/leave/teacher/${this.teacherId}`;
    const headers = this.getAuthHeaders();
    
    this.http.get<LeaveRequest[]>(url, { headers }).subscribe({
      next: (leaves) => {
        this.pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;
        this.approvedLeaves = leaves.filter(l => l.status === 'APPROVED').length;
      },
      error: (err) => {
        console.error('Error fetching leave stats:', err);
        this.handleError(err, 'Failed to load leave statistics');
      }
    });
  }

  refreshOverview(): void {
    this.clearMessages();
    this.loadOverviewData();
    this.showSuccess('Data refreshed successfully!');
  }

  // ==================== ATTENDANCE METHODS ====================

  onSubjectChange(): void {
    if (this.selectedSubjectId) {
      this.loadStudents();
    }
  }

  loadStudents(): void {
    if (!this.selectedSubjectId) {
      this.showError('Please select a subject');
      return;
    }

    this.isLoadingStudents = true;
    this.clearMessages();
    this.students = [];

    const url = `${this.baseUrl}/students/course/${this.selectedSubjectId}`;
    const headers = this.getAuthHeaders();

    this.http.get<Student[]>(url, { headers }).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.students = data.map(s => ({ 
            ...s, 
            present: false,
            notes: ''
          }));
          this.showSuccess(`Loaded ${data.length} student${data.length > 1 ? 's' : ''}`);
        } else {
          this.showError('No students enrolled in this course');
        }
        this.isLoadingStudents = false;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.handleError(err, 'Failed to load students');
        this.students = [];
        this.isLoadingStudents = false;
      }
    });
  }

  markAllPresent(): void {
    if (this.students.length === 0) {
      this.showError('No students to mark');
      return;
    }
    this.students.forEach(s => s.present = true);
    this.showSuccess(`Marked all ${this.students.length} students as present`);
  }

  markAllAbsent(): void {
    if (this.students.length === 0) {
      this.showError('No students to mark');
      return;
    }
    this.students.forEach(s => s.present = false);
    this.showSuccess(`Marked all ${this.students.length} students as absent`);
  }

 submitAttendance(): void {
  // Validation
  if (!this.validateAttendanceSubmission()) {
    return;
  }

  // NEW: Validate session is selected
  if (!this.selectedSession) {
    this.showError('Please select a session time');
    return;
  }

  // Confirm submission
  if (!this.confirmAttendanceSubmission()) {
    return;
  }

  this.isSubmitting = true;
  this.clearMessages();

  const attendanceData: AttendanceSubmission = {
    courseId: this.selectedSubjectId,
    attendanceDate: this.attendanceDate,
    session: this.selectedSession, // NEW: Include session
    studentAttendances: this.students.map(s => ({
      studentId: s.id,
      status: s.present ? 'PRESENT' : 'ABSENT',
      notes: s.notes || ''
    }))
  };

  console.log('Submitting attendance:', attendanceData);

  const url = `${this.baseUrl}/teacher/mark-attendance`; // Updated endpoint
  const headers = this.getAuthHeaders();

    this.http.post(url, attendanceData, { headers }).subscribe({
    next: (response) => {
      console.log('Attendance marked successfully:', response);
      
      // FIX: Use helper method instead of inline find
      const sessionDisplay = this.getSessionFullDisplay();
      this.showSuccess(`✓ Attendance marked successfully for ${this.students.length} student(s) in ${sessionDisplay}!`);
      this.isSubmitting = false;

       this.selectedSession = ''; 
      
      // Save course and date for email feature
      this.lastMarkedCourseId = this.selectedSubjectId;
      this.lastMarkedDate = this.attendanceDate;
      
      // Automatically load absent students
      this.loadAbsentStudents();
      
      // Navigate to absent students view
      this.navigateTo('absent-students');
    },
    error: (err) => {
      console.error('Error submitting attendance:', err);
      this.handleAttendanceError(err);
      this.isSubmitting = false;
    }
  });
}
  private validateAttendanceSubmission(): boolean {
    if (!this.selectedSubjectId) {
      this.showError('Please select a subject');
      return false;
    }

    if (this.students.length === 0) {
      this.showError('No students to mark attendance for');
      return false;
    }

    if (!this.validateAttendanceDate()) {
      return false;
    }

    return true;
  }

  private validateAttendanceDate(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(this.attendanceDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Prevent future dates
    if (selectedDate > today) {
      this.showError('Cannot mark attendance for future dates');
      return false;
    }
    
    // Prevent dates older than specified days
    const maxAgeDate = new Date(today);
    maxAgeDate.setDate(maxAgeDate.getDate() - this.MAX_ATTENDANCE_AGE_DAYS);
    
    if (selectedDate < maxAgeDate) {
      this.showError(`Cannot mark attendance for dates older than ${this.MAX_ATTENDANCE_AGE_DAYS} days`);
      return false;
    }
    
    return true;
  }

private confirmAttendanceSubmission(): boolean {
  const summary = this.getAttendanceSummary();
  const selectedSubject = this.subjects.find(s => s.id === this.selectedSubjectId);
  const subjectName = selectedSubject?.name || 'Selected Course';
  const sessionDisplay = this.getSessionFullDisplay(); // Use helper method
  
  const message = `Confirm Attendance Submission\n\n` +
                 `Course: ${subjectName}\n` +
                 `Date: ${this.attendanceDate}\n` +
                 `Session: ${sessionDisplay}\n\n` +
                 `${summary}\n\n` +
                 `Do you want to proceed?`;
  
  return confirm(message);
}

  private handleAttendanceError(err: any): void {
    if (err.status === 500) {
      const errorMsg = err.error?.message || 'Server error occurred';
      this.showError(`Server Error: ${errorMsg}`);
    } else if (err.status === 400) {
      const errorMsg = err.error?.message || 'Invalid data provided';
      this.showError(`Validation Error: ${errorMsg}`);
    } else if (err.status === 403) {
      this.showError('You are not authorized to mark attendance for this course');
    } else {
      this.handleError(err, 'Failed to submit attendance');
    }
  }

  getPresentCount(): number {
    return this.students.filter(s => s.present).length;
  }

  getAbsentCount(): number {
    return this.students.filter(s => !s.present).length;
  }

  getSessionDisplay(): string {
  if (!this.selectedSession) {
    return 'Not Selected';
  }
  
  const session = this.availableSessions.find(s => s.name === this.selectedSession);
  return session ? session.timeRange : this.selectedSession;
}

/**
 * Get full session name for display
 */
getSessionFullDisplay(): string {
  if (!this.selectedSession) {
    return 'No Session Selected';
  }
  
  const session = this.availableSessions.find(s => s.name === this.selectedSession);
  return session ? session.displayName : this.selectedSession;
}

  

  getAttendanceSummary(): string {
    const presentCount = this.getPresentCount();
    const absentCount = this.getAbsentCount();
    const totalCount = this.students.length;
    const presentPercentage = totalCount > 0 
      ? ((presentCount / totalCount) * 100).toFixed(1) 
      : '0';
    
    return `Present: ${presentCount} (${presentPercentage}%) | Absent: ${absentCount} | Total: ${totalCount}`;
  }

  // ==================== LEAVE APPLICATION METHODS ====================

  validateDates(): boolean {
    if (!this.leaveData.startDate || !this.leaveData.endDate) {
      return true; // Let form validation handle empty fields
    }

    const start = new Date(this.leaveData.startDate);
    const end = new Date(this.leaveData.endDate);
    
    if (end < start) {
      this.showError('End date cannot be before start date');
      return false;
    }

    return true;
  }

  calculateLeaveDays(): number {
    if (!this.leaveData.startDate || !this.leaveData.endDate) {
      return 0;
    }

    const start = new Date(this.leaveData.startDate);
    const end = new Date(this.leaveData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  submitLeaveRequest(): void {
    this.clearMessages();

    // Validation
    if (!this.leaveData.startDate || !this.leaveData.endDate || !this.leaveData.reason.trim()) {
      this.showError('Please fill in all fields');
      return;
    }

    if (!this.validateDates()) {
      return;
    }

    if (this.leaveData.reason.trim().length < 10) {
      this.showError('Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    // Confirmation
    const leaveDays = this.calculateLeaveDays();
    if (!confirm(`Submit leave request for ${leaveDays} day${leaveDays > 1 ? 's' : ''}?`)) {
      return;
    }

    this.isSubmitting = true;
    const url = `${this.baseUrl}/leave/apply`;
    const headers = this.getAuthHeaders();

    this.http.post(url, this.leaveData, { headers }).subscribe({
      next: () => {
        this.showSuccess('✓ Leave request submitted successfully!');
        this.isSubmitting = false;
        this.resetLeaveForm();
        this.loadLeaveStats();
      },
      error: (err) => {
        console.error('Error submitting leave:', err);
        this.handleError(err, 'Failed to submit leave request');
        this.isSubmitting = false;
      }
    });
  }

  private resetLeaveForm(): void {
    this.leaveData = {
      teacherId: this.teacherId,
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  // ==================== LEAVE STATUS METHODS ====================

  loadMyLeaves(): void {
    this.isLoadingLeaves = true;
    this.clearMessages();
    
    const url = `${this.baseUrl}/leave/teacher/${this.teacherId}`;
    const headers = this.getAuthHeaders();
    
    this.http.get<LeaveRequest[]>(url, { headers }).subscribe({
      next: (leaves) => {
        this.myLeaves = this.sortLeavesByDate(leaves);
        this.isLoadingLeaves = false;
        
        if (leaves.length === 0) {
          this.showError('No leave requests found');
        }
      },
      error: (err) => {
        console.error('Error fetching leaves:', err);
        this.handleError(err, 'Failed to load leave requests');
        this.isLoadingLeaves = false;
      }
    });
  }

  private sortLeavesByDate(leaves: LeaveRequest[]): LeaveRequest[] {
    return leaves.sort((a, b) => {
      const dateA = new Date(a.appliedDate || a.startDate).getTime();
      const dateB = new Date(b.appliedDate || b.startDate).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'PENDING': 'status-pending'
    };
    return statusMap[status] || '';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'APPROVED': '✓',
      'REJECTED': '✗',
      'PENDING': '⏱'
    };
    return iconMap[status] || '•';
  }

  // ==================== TEACHER LEAVE APPROVAL METHODS ====================

  loadTeacherPendingLeaves(): void {
    this.isLoadingTeacherLeaves = true;
    this.clearMessages();
    
    const url = `${this.baseUrl}/leave/pending-approvals`;
    const headers = this.getAuthHeaders();
    
    this.http.get<PendingLeaveApproval[]>(url, { headers }).subscribe({
      next: (leaves) => {
        this.teacherPendingLeaves = leaves;
        this.isLoadingTeacherLeaves = false;
        
        if (leaves.length === 0) {
          this.showError('No pending teacher leave requests found');
        }
      },
      error: (err) => {
        console.error('Error fetching teacher pending leaves:', err);
        this.handleError(err, 'Failed to load teacher leave requests');
        this.isLoadingTeacherLeaves = false;
      }
    });
  }

  approveTeacherLeave(leaveId: number): void {
    const leave = this.teacherPendingLeaves.find(l => l.id === leaveId);
    
    if (!confirm(`Approve leave request from ${leave?.userName}?\n\nFrom: ${leave?.startDate}\nTo: ${leave?.endDate}\nReason: ${leave?.reason}`)) {
      return;
    }

    const url = `${this.baseUrl}/leave/${leaveId}/approve`;
    const headers = this.getAuthHeaders();
    
    this.http.put(url, {}, { headers }).subscribe({
      next: () => {
        this.showSuccess('✓ Leave request approved successfully!');
        this.loadTeacherPendingLeaves();
      },
      error: (err) => {
        console.error('Error approving teacher leave:', err);
        this.handleError(err, 'Failed to approve leave request');
      }
    });
  }

  rejectTeacherLeave(leaveId: number): void {
    const leave = this.teacherPendingLeaves.find(l => l.id === leaveId);
    const reason = prompt(`Reject leave request from ${leave?.userName}?\n\nPlease enter rejection reason (minimum 10 characters):`);
    
    if (!reason || reason.trim().length < 10) {
      this.showError('Rejection reason must be at least 10 characters');
      return;
    }

    const url = `${this.baseUrl}/leave/${leaveId}/reject`;
    const headers = this.getAuthHeaders();
    
    this.http.put(url, { rejectionReason: reason }, { headers }).subscribe({
      next: () => {
        this.showSuccess('✓ Leave request rejected');
        this.loadTeacherPendingLeaves();
      },
      error: (err) => {
        console.error('Error rejecting teacher leave:', err);
        this.handleError(err, 'Failed to reject leave request');
      }
    });
  }

  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  // ==================== EMPLOYEE LEAVE APPROVAL METHODS ====================

  loadEmployeePendingLeaves(): void {
    this.isLoadingEmployeeLeaves = true;
    this.clearMessages();
    
    const url = `${this.baseUrl}/employee-leaves/pending`;
    const headers = this.getAuthHeaders();
    
    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        // Handle both array response and object with leaves property
        this.employeePendingLeaves = Array.isArray(response) ? response : (response.leaves || []);
        this.isLoadingEmployeeLeaves = false;
        
        if (this.employeePendingLeaves.length === 0) {
          this.showError('No pending employee leave requests found');
        }
      },
      error: (err) => {
        console.error('Error fetching employee pending leaves:', err);
        this.handleError(err, 'Failed to load employee leave requests');
        this.isLoadingEmployeeLeaves = false;
      }
    });
  }

  approveEmployeeLeave(leaveId: number): void {
    const leave = this.employeePendingLeaves.find(l => l.id === leaveId);
    
    if (!confirm(`Approve employee leave request from ${leave?.employeeName}?\n\nFrom: ${leave?.startDate}\nTo: ${leave?.endDate}\nReason: ${leave?.reason}`)) {
      return;
    }

    const url = `${this.baseUrl}/employee-leaves/${leaveId}/approve`;
    const headers = this.getAuthHeaders();
    
    this.http.put(url, {}, { headers }).subscribe({
      next: () => {
        this.showSuccess('✓ Employee leave request approved successfully!');
        this.loadEmployeePendingLeaves();
      },
      error: (err) => {
        console.error('Error approving employee leave:', err);
        this.handleError(err, 'Failed to approve employee leave request');
      }
    });
  }

  rejectEmployeeLeave(leaveId: number): void {
    const leave = this.employeePendingLeaves.find(l => l.id === leaveId);
    const reason = prompt(`Reject employee leave request from ${leave?.employeeName}?\n\nPlease enter rejection reason (minimum 10 characters):`);
    
    if (!reason || reason.trim().length < 10) {
      this.showError('Rejection reason must be at least 10 characters');
      return;
    }

    const url = `${this.baseUrl}/employee-leaves/${leaveId}/reject`;
    const headers = this.getAuthHeaders();
    
    this.http.put(url, { reason: reason }, { headers }).subscribe({
      next: () => {
        this.showSuccess('✓ Employee leave request rejected');
        this.loadEmployeePendingLeaves();
      },
      error: (err) => {
        console.error('Error rejecting employee leave:', err);
        this.handleError(err, 'Failed to reject employee leave request');
      }
    });
  }

  // ==================== HTTP UTILITY METHODS ====================

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== ERROR HANDLING ====================

  private handleError(err: any, defaultMessage: string): void {
    console.error('Error occurred:', err);

    if (err.status === 403 || err.status === 401) {
      this.handleAuthError(err.status);
      return;
    }

    const errorMessage = this.extractErrorMessage(err, defaultMessage);
    this.showError(errorMessage);
  }

  private handleAuthError(status: number): void {
    const message = status === 403 
      ? 'Access denied. Please login again.' 
      : 'Session expired. Please login again.';
    
    this.showError(message);
    this.redirectToLogin(2000);
  }

  private extractErrorMessage(err: any, defaultMessage: string): string {
    return err.error?.message || err.error?.error || err.message || defaultMessage;
  }

  private redirectToLogin(delay: number = 0): void {
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    }, delay);
  }

  // ==================== UI MESSAGE METHODS ====================

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      if (this.successMessage === message) {
        this.successMessage = '';
      }
    }, 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  // ==================== ABSENT STUDENTS & EMAIL METHODS ====================

  /**
   * Load absent students for the last marked attendance
   */
  loadAbsentStudents(): void {
    if (!this.lastMarkedCourseId || !this.lastMarkedDate) {
      this.showError('No recent attendance record found');
      return;
    }

    this.isLoadingAbsentStudents = true;
    this.clearMessages();
    this.absentStudents = [];
    this.selectedAbsentStudentIds = [];

    const url = `${this.baseUrl}/attendance/absent-students?courseId=${this.lastMarkedCourseId}&date=${this.lastMarkedDate}`;
    const headers = this.getAuthHeaders();

    console.log('Loading absent students from:', url);

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        console.log('Absent students response:', response);
        
        if (response.success && response.students) {
          this.absentStudents = response.students;
          // Pre-select all absent students
          this.selectedAbsentStudentIds = this.absentStudents.map(s => s.id);
          
          if (this.absentStudents.length > 0) {
            this.showSuccess(`Found ${this.absentStudents.length} absent student(s)`);
          } else {
            this.showSuccess('Great! No students were absent.');
          }
        } else {
          this.showError('No absent students found');
        }
        
        this.isLoadingAbsentStudents = false;
      },
      error: (err) => {
        console.error('Error loading absent students:', err);
        this.handleError(err, 'Failed to load absent students');
        this.isLoadingAbsentStudents = false;
      }
    });
  }

  /**
   * Toggle student selection for email
   */
  toggleStudentSelection(studentId: number): void {
    const index = this.selectedAbsentStudentIds.indexOf(studentId);
    
    if (index > -1) {
      // Remove from selection
      this.selectedAbsentStudentIds.splice(index, 1);
    } else {
      // Add to selection
      this.selectedAbsentStudentIds.push(studentId);
    }
  }

  /**
   * Check if student is selected
   */
  isStudentSelected(studentId: number): boolean {
    return this.selectedAbsentStudentIds.includes(studentId);
  }

  /**
   * Select all absent students
   */
  selectAllAbsentStudents(): void {
    this.selectedAbsentStudentIds = this.absentStudents.map(s => s.id);
    this.showSuccess('All students selected');
  }

  /**
   * Deselect all absent students
   */
  deselectAllAbsentStudents(): void {
    this.selectedAbsentStudentIds = [];
    this.showSuccess('All students deselected');
  }

  /**
   * Send absence notification emails
   */
  sendAbsenceEmails(): void {
    if (this.selectedAbsentStudentIds.length === 0) {
      this.showError('Please select at least one student to send email');
      return;
    }

    const selectedCount = this.selectedAbsentStudentIds.length;
    const confirmMsg = `Send absence notification email to ${selectedCount} student${selectedCount > 1 ? 's' : ''}?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    this.isSendingEmails = true;
    this.clearMessages();

    const emailData = {
      courseId: this.lastMarkedCourseId,
      attendanceDate: this.lastMarkedDate,
      studentIds: this.selectedAbsentStudentIds
    };

    const url = `${this.baseUrl}/attendance/send-simple-emails`;
    const headers = this.getAuthHeaders();

    console.log('Sending emails:', emailData);

    this.http.post<any>(url, emailData, { headers }).subscribe({
      next: (response) => {
        console.log('Email response:', response);
        
        if (response.success) {
          const emailsSent = response.emailsSent || 0;
          this.showSuccess(`✓ Successfully sent ${emailsSent} email${emailsSent !== 1 ? 's' : ''}!`);
          
          // Clear selection after successful send
          this.selectedAbsentStudentIds = [];
        } else {
          this.showError('Failed to send emails');
        }
        
        this.isSendingEmails = false;
      },
      error: (err) => {
        console.error('Error sending emails:', err);
        this.handleError(err, 'Failed to send absence notification emails');
        this.isSendingEmails = false;
      }
    });
  }

  /**
   * Get the course name for display
   */
  getLastMarkedCourseName(): string {
    const course = this.subjects.find(s => s.id === this.lastMarkedCourseId);
    return course?.name || 'Unknown Course';
  }

  /**
   * Go back to attendance view
   */
  backToAttendance(): void {
    this.navigateTo('attendance');
  }

  // ==================== SCHEDULE METHODS ====================

/**
 * Load all schedules for the teacher
 */
loadTeacherSchedules(): void {
  this.isLoadingSchedules = true;
  this.clearMessages();
  
  const url = `${this.baseUrl}/teacher/schedules/weekly?teacherId=${this.teacherId}`;
  const headers = this.getAuthHeaders();
  
  this.http.get<any>(url, { headers }).subscribe({
    next: (response) => {
      console.log('Weekly schedule response:', response);
      
      if (response.success && response.weeklySchedule) {
        this.weeklySchedules = response.weeklySchedule;
        
        // Flatten all schedules into a single array
        this.schedules = [];
        Object.keys(response.weeklySchedule).forEach(day => {
          this.schedules.push(...response.weeklySchedule[day]);
        });
        
        // Set today as default selected day
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        this.selectedDay = today;
        
        // Load today's schedules
        this.loadTodaySchedules();
        
        const totalClasses = response.totalClasses || this.schedules.length;
        this.showSuccess(`Loaded ${totalClasses} class schedule(s)`);
      } else {
        this.showError('No schedules found');
      }
      
      this.isLoadingSchedules = false;
    },
    error: (err) => {
      console.error('Error loading schedules:', err);
      this.handleError(err, 'Failed to load schedules');
      this.isLoadingSchedules = false;
    }
  });
}

/**
 * Load today's schedules
 */
loadTodaySchedules(): void {
  const url = `${this.baseUrl}/teacher/schedules/today?teacherId=${this.teacherId}`;
  const headers = this.getAuthHeaders();
  
  this.http.get<any>(url, { headers }).subscribe({
    next: (response) => {
      if (response.success && response.schedules) {
        this.todaySchedules = response.schedules;
      }
    },
    error: (err) => {
      console.error('Error loading today schedules:', err);
    }
  });
}

/**
 * Get schedules for a specific day
 */
getSchedulesForDay(day: string): Schedule[] {
  return this.weeklySchedules[day] || [];
}

/**
 * Filter schedules by selected day
 */
filterByDay(day: string): void {
  this.selectedDay = day;
}

/**
 * Check if a day has classes
 */
hasDayClasses(day: string): boolean {
  return this.weeklySchedules[day]?.length > 0;
}

/**
 * Get day schedule count
 */
getDayClassCount(day: string): number {
  return this.weeklySchedules[day]?.length || 0;
}

/**
 * Get today's day name
 */
getTodayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
}

/**
 * Check if selected day is today
 */
isToday(day: string): boolean {
  return day === this.getTodayName();
}

  // ==================== LOGOUT ====================

  logout(): void {
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (confirmed) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}