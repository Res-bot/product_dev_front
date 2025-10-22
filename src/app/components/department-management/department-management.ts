import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AddDepartmentModalComponent } from "../../add-department/add-department"
import { HttpClient } from "@angular/common/http"

@Component({
  selector: "app-department-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AddDepartmentModalComponent],
  templateUrl: "./department-management.html",
  styleUrls: ["./department-management.scss"],
})
export class DepartmentManagementComponent implements OnInit {
  isAddDepartmentModalOpen = false
  isEditMode = false
  editIndex: number | null = null

  // ID tracker for proper ID generation
  private nextId = 6

  // Array of departments
  departments: any[] = [
    // { id: 1, name: 'Computer Science', code: 'CSE', head: 'Dr. Rakesh Kumar' },
    // { id: 2, name: 'Information Technology', code: 'IT', head: 'Prof. Sneha Nair' },
    // { id: 3, name: 'Electronics and Communication', code: 'ECE', head: 'Dr. Manoj Patra' },
    // { id: 4, name: 'Mechanical Engineering', code: 'MECH', head: 'Prof. Ankit Singh' },
    // { id: 5, name: 'Civil Engineering', code: 'CIVIL', head: 'Dr. Priya Das' }
  ]

  // constructor(private http:HttpClient){
  //   this.getData();
  // }

  ngOnInit(): void {}

  // Open modal for adding department
  onAdddepartment(): void {
    this.isEditMode = false
    this.editIndex = null
    this.isAddDepartmentModalOpen = true
  }

  // Close modal
  onCloseModal(): void {
    this.isAddDepartmentModalOpen = false
    this.isEditMode = false
    this.editIndex = null
  }

  // Add or update department
  onSubmitDepartment(departmentData: any): void {
    // Validate that we have data
    if (!departmentData || !departmentData.name || !departmentData.code || !departmentData.head) {
      console.error('Invalid department data received')
      return
    }

    if (this.isEditMode && this.editIndex !== null) {
      // Update existing department - preserve the ID
      this.departments[this.editIndex] = {
        id: this.departments[this.editIndex].id,
        name: departmentData.name,
        code: departmentData.code,
        head: departmentData.head
      }
      console.log("Department updated:", this.departments[this.editIndex])
      window.alert("Department successfully updated 👌")
    } else {
      // Add new department with proper ID
      const newDepartment = {
        id: this.nextId++,
        name: departmentData.name,
        code: departmentData.code,
        head: departmentData.head
      }
      this.departments.push(newDepartment)
      console.log("New department added:", newDepartment)
      window.alert("Department successfully added 👌")
    }

    // Close modal and reset state
    this.onCloseModal()
  }

  // Edit a department
  onEdit(department: any): void {
    this.editIndex = this.departments.findIndex(d => d.id === department.id)
    if (this.editIndex > -1) {
      this.isEditMode = true
      this.isAddDepartmentModalOpen = true
    }
  }

  // Delete a department
  onDelete(department: any): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${department.name}"?`)
    if (confirmDelete) {
      this.departments = this.departments.filter(d => d.id !== department.id)
      console.log("Department deleted:", department)
      window.alert("Department successfully deleted")
    }
  }



}