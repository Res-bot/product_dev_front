import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from "@angular/common/http";
import { AddDepartmentModalComponent } from "../../Addmodal-components/add-department/add-department";

interface Department {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: "app-department-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AddDepartmentModalComponent, HttpClientModule],
  templateUrl: "./department-management.html",
  styleUrls: ["./department-management.scss"],
})
export class DepartmentManagementComponent implements OnInit {
  isAddDepartmentModalOpen = false;
  isEditMode = false;
  editDepartment: any = null;

  departments: Department[] = [];
  isLoading = false;
  
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log("Departments loaded:", data);
          this.departments = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error("Error loading departments:", error);
          this.isLoading = false;
          this.cdr.detectChanges();
          alert("Failed to load departments. Make sure backend is running on port 8080");
        }
      });
  }

  onAdddepartment(): void {
    this.isEditMode = false;
    this.editDepartment = null;
    this.isAddDepartmentModalOpen = true;
  }

  onCloseModal(): void {
    this.isAddDepartmentModalOpen = false;
    this.isEditMode = false;
    this.editDepartment = null;
  }

  onSubmitDepartment(departmentData: any): void {
    const departmentDTO = {
      name: departmentData.name,
      description: departmentData.description
    };

    if (this.isEditMode && this.editDepartment) {
      
      this.http.put<any>(`${this.apiUrl}/departments/${this.editDepartment.id}`, departmentDTO, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            console.log('Department updated successfully:', response);
            alert("Department updated successfully!");
            this.loadDepartments();
            this.onCloseModal();
          },
          error: (error: HttpErrorResponse) => {
            console.error("Error updating department:", error);
            console.error("Error details:", error.error);
            alert(error.error?.message || error.message || "Failed to update department");
          }
        });
    } else {
      
      this.http.post<any>(`${this.apiUrl}/departments`, departmentDTO, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            console.log('Department created successfully:', response);
            alert("Department added successfully!");
            this.loadDepartments();
            this.onCloseModal();
          },
          error: (error: HttpErrorResponse) => {
            console.error("Error creating department:", error);
            console.error("Error details:", error.error);
            alert(error.error?.message || error.message || "Failed to add department");
          }
        });
    }
  }

  onEdit(department: Department): void {
    this.editDepartment = {
      id: department.id,
      name: department.name,
      description: department.description
    };
    this.isEditMode = true;
    this.isAddDepartmentModalOpen = true;
  }

  onDelete(department: Department): void {
    if (!confirm(`Are you sure you want to delete "${department.name}"?`)) {
      return;
    }

    this.http.delete(`${this.apiUrl}/departments/${department.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          console.log('Department deleted successfully');
          alert("Department deleted successfully!");
          this.loadDepartments();
        },
        error: (error: HttpErrorResponse) => {
          console.error("Error deleting department:", error);
          alert(error.error?.message || error.message || "Failed to delete department");
        }
      });
  }
}