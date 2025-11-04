// ============================================================
// FILE 1: schedule-management.component.ts
// Location: src/app/Admindashboard-component/schedule-management/schedule-management.component.ts
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Schedule {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  batch?: string;
  notes?: string;
  courseId: number;
  courseName?: string;
  courseCode?: string;
  teacherId: number;
  teacherName?: string;
  departmentId?: number;
  departmentName?: string;
}

interface Course {
  id: number;
  name: string;
  courseCode: string;
  credits: number;
  departmentId: number;
  departmentName: string;
  teacherId: number;
  teacherName: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  department: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedulemanagement.html',
  styleUrls: ['./schedulemanagement.scss']
})
export class ScheduleManagementComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/admin';

  // Data
  schedules: Schedule[] = [];
  courses: Course[] = [];
  teachers: Teacher[] = [];
  departments: Department[] = [];
  
  // View mode
  viewMode: 'table' | 'timetable' = 'table';
  selectedDay: string = 'MONDAY';
  
  // Loading & Error states
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  
  // Form data
  scheduleForm: Schedule = this.getEmptySchedule();
  scheduleToDelete: Schedule | null = null;
  
  // Days of week
  days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  // Time slots for dropdown
  timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  // ==================== DATA LOADING ====================
  
  loadAllData(): void {
    this.isLoading = true;
    this.error = null;

    Promise.all([
      this.loadSchedules(),
      this.loadCourses(),
      this.loadTeachers(),
      this.loadDepartments()
    ]).then(() => {
      this.isLoading = false;
      console.log('✅ All data loaded successfully');
    }).catch((error) => {
      this.isLoading = false;
      this.error = 'Failed to load data. Please try again.';
      console.error('❌ Error loading data:', error);
    });
  }

  private loadSchedules(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Schedule[]>(`${this.apiUrl}/schedules`, { headers: this.getHeaders() })
        .subscribe({
          next: (data) => {
            this.schedules = data;
            console.log('✅ Schedules loaded:', data.length);
            resolve();
          },
          error: (err) => {
            console.error('❌ Error loading schedules:', err);
            reject(err);
          }
        });
    });
  }

  private loadCourses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Course[]>(`${this.apiUrl}/courses`, { headers: this.getHeaders() })
        .subscribe({
          next: (data) => {
            this.courses = data;
            console.log('✅ Courses loaded:', data.length);
            resolve();
          },
          error: (err) => {
            console.error('❌ Error loading courses:', err);
            reject(err);
          }
        });
    });
  }

  private loadTeachers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Teacher[]>(`${this.apiUrl}/teachers`, { headers: this.getHeaders() })
        .subscribe({
          next: (data) => {
            this.teachers = data;
            console.log('✅ Teachers loaded:', data.length);
            resolve();
          },
          error: (err) => {
            console.error('❌ Error loading teachers:', err);
            reject(err);
          }
        });
    });
  }

  private loadDepartments(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Department[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() })
        .subscribe({
          next: (data) => {
            this.departments = data;
            console.log('✅ Departments loaded:', data.length);
            resolve();
          },
          error: (err) => {
            console.error('❌ Error loading departments:', err);
            reject(err);
          }
        });
    });
  }

  // ==================== CRUD OPERATIONS ====================

  openAddModal(): void {
    this.scheduleForm = this.getEmptySchedule();
    this.showAddModal = true;
  }

  openEditModal(schedule: Schedule): void {
    this.scheduleForm = { ...schedule };
    this.showEditModal = true;
  }

  openDeleteModal(schedule: Schedule): void {
    this.scheduleToDelete = schedule;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.scheduleForm = this.getEmptySchedule();
    this.scheduleToDelete = null;
  }

  createSchedule(): void {
    if (!this.validateScheduleForm()) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.http.post<Schedule>(`${this.apiUrl}/schedules`, this.scheduleForm, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log('✅ Schedule created:', data);
          this.successMessage = 'Schedule created successfully!';
          this.loadSchedules();
          this.closeModals();
          this.isLoading = false;
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('❌ Error creating schedule:', err);
          this.error = err.error?.message || 'Failed to create schedule';
          this.isLoading = false;
        }
      });
  }

  updateSchedule(): void {
    if (!this.validateScheduleForm() || !this.scheduleForm.id) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.http.put<Schedule>(
      `${this.apiUrl}/schedules/${this.scheduleForm.id}`,
      this.scheduleForm,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        console.log('✅ Schedule updated:', data);
        this.successMessage = 'Schedule updated successfully!';
        this.loadSchedules();
        this.closeModals();
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('❌ Error updating schedule:', err);
        this.error = err.error?.message || 'Failed to update schedule';
        this.isLoading = false;
      }
    });
  }

  confirmDelete(): void {
    if (!this.scheduleToDelete?.id) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.http.delete(
      `${this.apiUrl}/schedules/${this.scheduleToDelete.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        console.log('✅ Schedule deleted');
        this.successMessage = 'Schedule deleted successfully!';
        this.loadSchedules();
        this.closeModals();
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('❌ Error deleting schedule:', err);
        this.error = err.error?.message || 'Failed to delete schedule';
        this.isLoading = false;
      }
    });
  }

  // ==================== HELPERS ====================

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private getEmptySchedule(): Schedule {
    return {
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      roomNumber: '',
      batch: '',
      notes: '',
      courseId: 0,
      teacherId: 0
    };
  }

  private validateScheduleForm(): boolean {
    if (!this.scheduleForm.courseId || this.scheduleForm.courseId === 0) {
      this.error = 'Please select a course';
      return false;
    }
    if (!this.scheduleForm.teacherId || this.scheduleForm.teacherId === 0) {
      this.error = 'Please select a teacher';
      return false;
    }
    if (!this.scheduleForm.startTime || !this.scheduleForm.endTime) {
      this.error = 'Please select start and end times';
      return false;
    }
    if (this.scheduleForm.startTime >= this.scheduleForm.endTime) {
      this.error = 'End time must be after start time';
      return false;
    }
    return true;
  }

  // ==================== VIEW HELPERS ====================

  setViewMode(mode: 'table' | 'timetable'): void {
    this.viewMode = mode;
  }

  selectDay(day: string): void {
    this.selectedDay = day;
  }

  getSchedulesForDay(day: string): Schedule[] {
    return this.schedules
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  getSchedulesByTimeSlot(day: string): { [key: string]: Schedule[] } {
    const schedules = this.getSchedulesForDay(day);
    const grouped: { [key: string]: Schedule[] } = {};
    
    schedules.forEach(schedule => {
      const key = `${schedule.startTime}-${schedule.endTime}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });
    
    return grouped;
  }

  onCourseChange(): void {
    const selectedCourse = this.courses.find(c => c.id === this.scheduleForm.courseId);
    if (selectedCourse) {
      this.scheduleForm.teacherId = selectedCourse.teacherId;
      this.scheduleForm.departmentId = selectedCourse.departmentId;
    }
  }

  formatTime(time: string): string {
    return time || '';
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? `${course.courseCode} - ${course.name}` : 'Unknown Course';
  }

  getTeacherName(teacherId: number): string {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  }
}