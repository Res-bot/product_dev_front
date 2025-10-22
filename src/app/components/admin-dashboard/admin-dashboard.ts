import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CourseManagementComponent } from '../course-management/course-management';
import { DepartmentManagementComponent } from '../department-management/department-management';
import { StudentManagementComponent } from '../employee-management/student-management';
import { Overview } from '../overview/overview';

interface Activity {
  id: number;
  title: string;
  time: string;
  iconType: 'user' | 'course' | 'edit';
}

interface StatCard {
  title: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative';
  iconType: 'student' | 'teacher' | 'employee' | 'course';
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  standalone: true,
  imports:[CommonModule,CourseManagementComponent,DepartmentManagementComponent,StudentManagementComponent,Overview],
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent {
  activeTab: string = 'overview';

  statCards: StatCard[] = [
    {
      title: 'Total Students',
      value: 5,
      change: '+12% vs last month',
      changeType: 'positive',
      iconType: 'student'
    },
    {
      title: 'Total Teachers',
      value: 5,
      change: '+8% vs last month',
      changeType: 'positive',
      iconType: 'teacher'
    },
    {
      title: 'Total Employees',
      value: 5,
      change: '+5% vs last month',
      changeType: 'positive',
      iconType: 'employee'
    },
    {
      title: 'Total Courses',
      value: 8,
      change: '+2 vs last month',
      changeType: 'positive',
      iconType: 'course'
    }
  ];

  activities: Activity[] = [
    {
      id: 1,
      title: 'New student Sarah Johnson registered',
      time: '2 minutes ago',
      iconType: 'user'
    },
    {
      id: 2,
      title: 'New course "Advanced Mathematics" created',
      time: '15 minutes ago',
      iconType: 'course'
    },
    {
      id: 3,
      title: 'Teacher Prof. Smith updated profile',
      time: '1 hour ago',
      iconType: 'edit'
    }
  ];

  constructor() {}

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onAddUser(): void {
    console.log('Add User clicked');
    // Implement add user logic
  }

  onAddCourse(): void {
    console.log('Add Course clicked');
    // Implement add course logic
  }

  onAddDepartment(): void {
    console.log('Add Department clicked');
    // Implement add department logic
  }

  onExportData(): void {
    console.log('Export Data clicked');
    // Implement export data logic
  }

  onExportReport(): void {
    console.log('Export Report clicked');
    // Implement export report logic
  }

  onChatWidget(): void {
    console.log('Chat widget clicked');
    // Implement chat widget logic
  }
}