import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Login } from './login/login';
import { Register } from './register/register';


export const routes: Routes = [
  // Default redirect to login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Public routes
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  // Admin routes with children
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./Admindashboard-component/admin-dashboard/admin-dashboard')
      .then(m => m.AdminDashboardComponent),
    children: [
      { 
        path: 'overview', 
        loadComponent: () => import('./Admindashboard-component/overview/overview')
          .then(m => m.Overview)
      },
      { 
        path: 'users', 
        loadComponent: () => import('./Admindashboard-component/employee-management/student-management')
          .then(m => m.StudentManagementComponent)
      },
      { 
        path: 'courses', 
        loadComponent: () => import('./Admindashboard-component/course-management/course-management')
          .then(m => m.CourseManagementComponent)
      },
      { 
        path: 'departments', 
        loadComponent: () => import('./Admindashboard-component/department-management/department-management')
          .then(m => m.DepartmentManagementComponent)
      },
      {
        path: 'schedules',
        loadComponent: () => import('./schedulemanagement/schedulemanagement')
          .then(m => m.ScheduleManagementComponent)
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  
  // Faculty/Teacher routes - Single unified component (no children needed)
  {
    path: 'faculty',
    canActivate: [AuthGuard],
    data: { roles: ['FACULTY', 'TEACHER'] },
    loadComponent: () => import('./teacherdashboard-component/teacherdashboard-component')
      .then(m => m.TeacherDashboardComponent)
  },
  
  // Student routes with children
  {
    path: 'student',
    canActivate: [AuthGuard],
    data: { roles: ['STUDENT'] },
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./studentdashboard-component/studentdashboard-component')
          .then(m => m.StudentDashboardComponent)
      },
      { 
        path: 'courses', 
        loadComponent: () => import('./course-enrollment/course-enrollment')
          .then(m => m.CourseEnrollmentComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Employee routes - Single component
  {
    path: 'employee',
    canActivate: [AuthGuard],
    data: { roles: ['EMPLOYEE'] },
    loadComponent: () => import('./employee-dashboard/employee-dashboard')
      .then(m => m.EmployeeDashboardComponent)
  },
  
  // Wildcard route - redirect to login for any unknown routes
  { path: '**', redirectTo: '/login' }
];