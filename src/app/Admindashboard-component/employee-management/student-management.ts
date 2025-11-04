import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpClientModule } from "@angular/common/http";
import { AddStudentModalComponent } from "../../Addmodal-components/add-student/add-student";

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  phoneno: string;
  role: string;
}

@Component({
  selector: "app-student-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AddStudentModalComponent, HttpClientModule],
  templateUrl: "./student-management.html",
  styleUrls: ["./student-management.scss"],
})
export class StudentManagementComponent implements OnInit {
  isAddStudentModalOpen = false;
  isEditMode = false;
  editingStudent: any = null;
  
  private apiUrl = "http://localhost:8080/api/admin";

  // Filters
  selectedRole = "all";
  selectedDepartment = "all";
  searchEmail = "";
  searchUserId = "";
  
  // Data
  students: User[] = [];
  departments: string[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.getAllUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadDepartments(): void {
    this.http.get<any[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() })
      .subscribe({
        next: (result) => {
          this.departments = result.map(dept => dept.name);
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading departments:', error);
          this.cdr.detectChanges();
        }
      });
  }

  getAllUsers(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (result) => {
          console.log('Users loaded:', result);
          this.students = result.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department || 'N/A',
            designation: user.designation || 'N/A',
            phoneno: user.phoneno || 'N/A',
            role: user.role
          }));
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching users:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Failed to load users. Please try again.');
        }
      });
  }

  getUserById(): void {
    if (!this.searchUserId || this.searchUserId.trim() === '') {
      alert('Please enter a User ID');
      return;
    }

    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/users/${this.searchUserId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          console.log('User found:', user);
          this.students = [{
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department || 'N/A',
            designation: user.designation || 'N/A',
            phoneno: user.phoneno || 'N/A',
            role: user.role
          }];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching user by ID:', error);
          this.isLoading = false;
          this.students = [];
          this.cdr.detectChanges();
          alert(error.error?.message || 'User not found');
        }
      });
  }

  getUsersByRole(): void {
    if (this.selectedRole === 'all') {
      this.getAllUsers();
      return;
    }

    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (result) => {
          console.log('All users loaded for role filtering:', result);
          
          this.students = result
            .filter(user => user.role === this.selectedRole)
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              department: user.department || 'N/A',
              designation: user.designation || 'N/A',
              phoneno: user.phoneno || 'N/A',
              role: user.role
            }));
          
          console.log(`Filtered ${this.students.length} users for role: ${this.selectedRole}`);
          this.isLoading = false;
          this.cdr.detectChanges();
          
          if (this.students.length === 0) {
            console.warn(`No users found for role: ${this.selectedRole}`);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching users for role filtering:', error);
          this.isLoading = false;
          this.students = [];
          this.cdr.detectChanges();
          alert('Failed to load users by role.');
        }
      });
  }

  getUsersByDepartment(): void {
    if (this.selectedDepartment === 'all') {
      this.getAllUsers();
      return;
    }

    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (result) => {
          console.log('All users loaded for department filtering:', result);
          
          this.students = result
            .filter(user => user.department === this.selectedDepartment)
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              department: user.department || 'N/A',
              designation: user.designation || 'N/A',
              phoneno: user.phoneno || 'N/A',
              role: user.role
            }));
          
          console.log(`Filtered ${this.students.length} users for department: ${this.selectedDepartment}`);
          this.isLoading = false;
          this.cdr.detectChanges();
          
          if (this.students.length === 0) {
            console.warn(`No users found for department: ${this.selectedDepartment}`);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching users for department filtering:', error);
          this.isLoading = false;
          this.students = [];
          this.cdr.detectChanges();
          alert('Failed to load users by department.');
        }
      });
  }

  searchUsersByEmail(): void {
    if (!this.searchEmail || this.searchEmail.trim() === '') {
      alert('Please enter an email to search');
      return;
    }

    this.isLoading = true;
    const encodedEmail = encodeURIComponent(this.searchEmail);
    
    this.http.get<any[]>(`${this.apiUrl}/users/search?keyword=${encodedEmail}`, { headers: this.getHeaders() })
      .subscribe({
        next: (result) => {
          console.log('Search results:', result);
          this.students = result.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department || 'N/A',
            designation: user.designation || 'N/A',
            phoneno: user.phoneno || 'N/A',
            role: user.role
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
          
          if (this.students.length === 0) {
            alert('No users found with that email');
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error searching users:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Failed to search users.');
        }
      });
  }

  clearFilters(): void {
    this.selectedRole = 'all';
    this.selectedDepartment = 'all';
    this.searchEmail = '';
    this.searchUserId = '';
    this.getAllUsers();
  }

  onRoleChange(): void {
    this.getUsersByRole();
  }

  onDepartmentChange(): void {
    this.getUsersByDepartment();
  }

  onAddStudent(): void {
    this.isEditMode = false;
    this.editingStudent = null;
    this.isAddStudentModalOpen = true;
  }

  onCloseModal(): void {
    this.isAddStudentModalOpen = false;
    this.isEditMode = false;
    this.editingStudent = null;
  }

  onSubmitStudent(studentData: any): void {
    if (this.isEditMode && this.editingStudent) {
      this.updateStudent(this.editingStudent.id, studentData);
    } else {
      this.addStudent(studentData);
    }
  }

  addStudent(studentData: any): void {
    const userData: any = {
      name: studentData.name,
      email: studentData.email,
      role: studentData.role || 'STUDENT',
      department: studentData.department,
      designation: studentData.designation
    };

    if (studentData.password) {
      userData.password = studentData.password;
    }

    if (studentData.phoneno) {
      userData.phoneno = studentData.phoneno;
    }

    console.log('Sending POST request with:', userData);

    this.http.post<any>(`${this.apiUrl}/users`, userData, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.getAllUsers();
          this.onCloseModal();
          alert('User added successfully!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating user:', error);
          alert(error.error?.message || error.message || 'Failed to add user. Please try again.');
        }
      });
  }

  updateStudent(studentId: number, studentData: any): void {
    const userDTO: any = {
      name: studentData.name,
      email: studentData.email,
      department: studentData.department,
      designation: studentData.designation,
      role: studentData.role || 'STUDENT'
    };
    
    if (studentData.password) {
      userDTO.password = studentData.password;
    }

    if (studentData.phoneno) {
      userDTO.phoneno = studentData.phoneno;
    }

    console.log('Sending PUT request with:', userDTO);

    this.http.put<any>(`${this.apiUrl}/users/${studentId}`, userDTO, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.getAllUsers();
          this.onCloseModal();
          alert('User updated successfully!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating user:', error);
          alert(error.error?.message || error.message || 'Failed to update user. Please try again.');
        }
      });
  }

  onEdit(student: any): void {
    this.editingStudent = { ...student };
    this.isEditMode = true;
    this.isAddStudentModalOpen = true;
  }

  onDelete(student: any): void {
    if (!confirm(`Are you sure you want to delete "${student.name}"?`)) {
      return;
    }
    
    this.http.delete(`${this.apiUrl}/users/${student.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          console.log('User deleted successfully');
          alert('User deleted successfully!');
          this.getAllUsers();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting user:', error);
          alert(error.error?.message || 'Failed to delete user. Please try again.');
        }
      });
  }
}