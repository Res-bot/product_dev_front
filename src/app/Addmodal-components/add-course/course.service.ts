import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses`, {
      headers: this.getHeaders()
    });
  }

  createCourse(course: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses`, course, {
      headers: this.getHeaders()
    });
  }

  updateCourse(courseId: number, course: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/courses/${courseId}`, course, {
      headers: this.getHeaders()
    });
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${courseId}`, {
      headers: this.getHeaders()
    });
  }

  getAllDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`, {
      headers: this.getHeaders()
    });
  }
}