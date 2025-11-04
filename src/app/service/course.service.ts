import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Course {
  id: number;
  courseCode: string;
  name: string;
  credits: number;
  description: string;
  teacherId: number;
  teacherName: string;
  departmentId: number;
  departmentName: string;
  enrolledStudentsCount: number;
  isEnrolled?: boolean;
}

export interface EnrollmentResponse {
  message: string;
  courseId: number;
  courseName?: string;
  courseCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private baseUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {
    console.log('✅ CourseService initialized');
  }

  /**
   * Get all available courses
   */
  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get course details by ID
   */
  getCourseDetails(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${courseId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get courses by department
   */
  getCoursesByDepartment(departmentId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/department/${departmentId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get courses the student is enrolled in
   */
  getEnrolledCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/student/enrolled`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get available courses for enrollment (not yet enrolled)
   */
  getAvailableCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/student/available`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Enroll in a course
   */
  enrollInCourse(courseId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(`${this.baseUrl}/${courseId}/enroll`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Unenroll from a course
   */
  unenrollFromCourse(courseId: number): Observable<EnrollmentResponse> {
    return this.http.delete<EnrollmentResponse>(`${this.baseUrl}/${courseId}/enroll`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handler
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
        errorMessage = 'Course not found.';
      } else if (error.status === 400) {
        errorMessage = error.error?.error || error.error?.message || 'Bad request';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error.';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Course Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}