import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../service/course.service';

@Component({
  selector: 'app-course-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-enrollment.html',
  styleUrls: ['./course-enrollment.scss']
})
export class CourseEnrollmentComponent implements OnInit {
  availableCourses: Course[] = [];
  enrolledCourses: Course[] = [];
  isLoading = true;
  error: string | null = null;
  activeTab: 'available' | 'enrolled' = 'available';
  searchTerm = '';

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.error = null;

    // Load both available and enrolled courses
    this.courseService.getAvailableCourses().subscribe({
      next: (courses) => {
        console.log('✅ Available courses loaded:', courses);
        this.availableCourses = courses;
        this.loadEnrolledCourses();
      },
      error: (err) => {
        console.error('❌ Error loading available courses:', err);
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  loadEnrolledCourses(): void {
    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        console.log('✅ Enrolled courses loaded:', courses);
        this.enrolledCourses = courses;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading enrolled courses:', err);
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  enrollInCourse(courseId: number, courseName: string): void {
    if (!confirm(`Are you sure you want to enroll in "${courseName}"?`)) {
      return;
    }

    console.log('📝 Enrolling in course:', courseId);

    this.courseService.enrollInCourse(courseId).subscribe({
      next: (response) => {
        console.log('✅ Enrollment successful:', response);
        alert(response.message);
        this.loadCourses(); // Refresh the lists
      },
      error: (err) => {
        console.error('❌ Enrollment failed:', err);
        alert(err.message || 'Failed to enroll in course');
      }
    });
  }

  unenrollFromCourse(courseId: number, courseName: string): void {
    if (!confirm(`Are you sure you want to unenroll from "${courseName}"?`)) {
      return;
    }

    console.log('🗑️ Unenrolling from course:', courseId);

    this.courseService.unenrollFromCourse(courseId).subscribe({
      next: (response) => {
        console.log('✅ Unenrollment successful:', response);
        alert(response.message);
        this.loadCourses(); // Refresh the lists
      },
      error: (err) => {
        console.error('❌ Unenrollment failed:', err);
        alert(err.message || 'Failed to unenroll from course');
      }
    });
  }

  switchTab(tab: 'available' | 'enrolled'): void {
    this.activeTab = tab;
  }

  get filteredAvailableCourses(): Course[] {
    if (!this.searchTerm) {
      return this.availableCourses;
    }
    const term = this.searchTerm.toLowerCase();
    return this.availableCourses.filter(course =>
      course.name.toLowerCase().includes(term) ||
      course.courseCode.toLowerCase().includes(term) ||
      course.teacherName.toLowerCase().includes(term)
    );
  }

  get filteredEnrolledCourses(): Course[] {
    if (!this.searchTerm) {
      return this.enrolledCourses;
    }
    const term = this.searchTerm.toLowerCase();
    return this.enrolledCourses.filter(course =>
      course.name.toLowerCase().includes(term) ||
      course.courseCode.toLowerCase().includes(term) ||
      course.teacherName.toLowerCase().includes(term)
    );
  }
}