import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { StudentManagementComponent } from './components/employee-management/student-management';
import { CourseManagementComponent } from './components/course-management/course-management';
import { DepartmentManagementComponent } from './components/department-management/department-management';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,App,AdminDashboardComponent,StudentManagementComponent,CourseManagementComponent,DepartmentManagementComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('attendance-dashboard');
}
