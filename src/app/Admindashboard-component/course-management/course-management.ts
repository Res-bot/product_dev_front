import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from "@angular/common/http";
import { AddCourseModalComponent } from "../../Addmodal-components/add-course/add-course";

interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  department: string;
  credits: string;
  departmentId?: number;
  teacherId?: number;
  teacherName?: string;
}

@Component({
  selector: "app-course-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AddCourseModalComponent, HttpClientModule],
  templateUrl: "./course-management.html",
  styleUrls: ["./course-management.scss"],
})
export class CourseManagementComponent implements OnInit {
  isAddCourseModalOpen = false;
  isEditMode = false;
  editCourse: any = null;

  courses: Course[] = [];
  departments: any[] = [];
  teachers: any[] = [];
  isLoading = false;
  
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
    this.loadDepartments();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadTeachers(): void {
    this.http.get<any[]>(`${this.apiUrl}/teachers`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log("Teachers loaded:", data);
          this.teachers = data;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error("Error loading teachers:", error);
          this.cdr.detectChanges();
          alert("Failed to load teachers");
        }
      });
  }

  loadDepartments(): void {
    this.http.get<any[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log("Departments loaded:", data);
          this.departments = data;
          this.cdr.detectChanges();
          this.loadCourses();
        },
        error: (error: HttpErrorResponse) => {
          console.error("Error loading departments:", error);
          this.cdr.detectChanges();
          alert("Failed to load departments");
        }
      });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/courses`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log("Courses raw data:", data);
          this.courses = data.map(course => ({
            id: course.id,
            courseName: course.name,
            courseCode: course.courseCode,
            department: this.getDepartmentName(course.departmentId),
            credits: course.credits.toString(),
            departmentId: course.departmentId,
            teacherId: course.teacherId,
            teacherName: course.teacherName || this.getTeacherName(course.teacherId)
          }));
          console.log("Courses mapped:", this.courses);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error("Error loading courses:", error);
          this.isLoading = false;
          this.cdr.detectChanges();
          alert("Failed to load courses. Make sure backend is running on port 8080");
        }
      });
  }

  getDepartmentName(departmentId: number): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : "Unknown";
  }

  getTeacherName(teacherId: number): string {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : "Unknown";
  }

  onAddcourse(): void {
    this.isEditMode = false;
    this.editCourse = null;
    this.isAddCourseModalOpen = true;
  }

  onCloseModal(): void {
    this.isAddCourseModalOpen = false;
    this.isEditMode = false;
    this.editCourse = null;
  }

  onSubmitCourse(courseData: any): void {
    const courseDTO = {
      courseCode: courseData.courseCode,
      name: courseData.name,
      credits: parseInt(courseData.credits),
      departmentId: courseData.departmentId,
      teacherId: courseData.teacherId,
      description: courseData.description || null
    };

    console.log("Submitting course:", courseDTO);

    if (this.isEditMode && this.editCourse) {
      // UPDATE COURSE
      this.http.put<any>(`${this.apiUrl}/courses/${this.editCourse.id}`, courseDTO, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            console.log('Course updated successfully:', response);
            alert("Course updated successfully!");
            this.loadCourses();
            this.onCloseModal();
          },
          error: (error: HttpErrorResponse) => {
            console.error("Error updating course:", error);
            console.error("Error details:", error.error);
            alert(error.error?.message || error.message || "Failed to update course");
          }
        });
    } else {
      // CREATE NEW COURSE
      this.http.post<any>(`${this.apiUrl}/courses`, courseDTO, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            console.log('Course created successfully:', response);
            alert("Course added successfully!");
            this.loadCourses();
            this.onCloseModal();
          },
          error: (error: HttpErrorResponse) => {
            console.error("Error creating course:", error);
            console.error("Error details:", error.error);
            alert(error.error?.message || error.message || "Failed to add course");
          }
        });
    }
  }

  onEdit(course: Course): void {
    this.editCourse = {
      id: course.id,
      name: course.courseName,
      courseCode: course.courseCode,
      departmentId: course.departmentId,
      credits: parseInt(course.credits),
      teacherId: course.teacherId
    };
    this.isEditMode = true;
    this.isAddCourseModalOpen = true;
  }

  onDelete(course: Course): void {
    if (!confirm(`Are you sure you want to delete "${course.courseName}"?`)) {
      return;
    }

    this.http.delete(`${this.apiUrl}/courses/${course.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          console.log('Course deleted successfully');
          alert("Course deleted successfully!");
          this.loadCourses();
        },
        error: (error: HttpErrorResponse) => {
          console.error("Error deleting course:", error);
          alert(error.error?.message || error.message || "Failed to delete course");
        }
      });
  }
}