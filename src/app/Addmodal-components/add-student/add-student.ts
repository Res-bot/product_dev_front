import { Component, EventEmitter, Input, Output, type OnChanges, type SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { HttpClient, HttpHeaders } from "@angular/common/http"

interface StudentForm {
  name: string
  email: string
  password: string
  department: string | null
  designation: string | null
  phoneno: string
  role: string
}

@Component({
  selector: "app-add-student-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./add-student.html",
  styleUrls: ["./add-student.scss"],
})
export class AddStudentModalComponent implements OnChanges {
  @Input() isOpen = false
  @Input() isEditMode = false
  @Input() studentData: any | null = null

  @Output() close = new EventEmitter<void>()
  @Output() submit = new EventEmitter<any>()

  form: StudentForm = {
    name: "",
    email: "",
    password: "",
    department: null,
    designation: null,
    phoneno: "",
    role: "STUDENT",
  }

  departments: string[] = []
  
  // All designations grouped by role
  allDesignations = {
    STUDENT: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    TEACHER: ["Assistant Professor", "Professor", "Associate Professor"],
    EMPLOYEE: ["Staff", "Lab Assistant", "Librarian", "Office Staff"],
    ADMIN: [] // No designation for admin
  }
  
  roles = ["STUDENT", "TEACHER", "ADMIN", "EMPLOYEE"]

  // Validation error messages
  phoneError: string = ""

  constructor(private http: HttpClient) {
    this.loadDepartments()
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token')
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    })
  }

  loadDepartments(): void {
    this.http.get<any[]>('http://localhost:8080/api/admin/departments', {
      headers: this.getHeaders()
    }).subscribe({
      next: (result) => {
        this.departments = result.map(dept => dept.name)
        console.log('Departments loaded:', this.departments)
      },
      error: (error) => {
        console.error('Error loading departments:', error)
        if (error.status === 403) {
          console.error('Access denied - check authentication token')
        } else if (error.status === 401) {
          console.error('Unauthorized - token may be invalid or expired')
        }
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When modal closes, reset form
    if (changes["isOpen"] && !this.isOpen) {
      this.resetForm()
      return
    }

    // When modal opens in edit mode, populate the form
    if (changes["studentData"] || changes["isEditMode"]) {
      if (this.isEditMode && this.studentData) {
        console.log('Loading student data for edit:', this.studentData)
        this.form = {
          name: this.studentData.name || "",
          email: this.studentData.email || "",
          password: "", // Always empty for security
          department: this.studentData.department || null,
          designation: this.studentData.designation || null,
          phoneno: this.studentData.phoneno || "",
          role: this.studentData.role || "STUDENT",
        }
      } else if (!this.isEditMode) {
        // Reset form when switching to add mode
        this.resetForm()
      }
    }
  }

  /**
   * Get available designations based on selected role
   */
  get availableDesignations(): string[] {
    if (!this.form.role) return []
    return this.allDesignations[this.form.role as keyof typeof this.allDesignations] || []
  }

  /**
   * Check if designation field should be shown
   */
  get shouldShowDesignation(): boolean {
    return this.form.role !== 'ADMIN'
  }

  /**
   * Check if designation is required for the current role
   */
  get isDesignationRequired(): boolean {
    return this.form.role !== 'ADMIN' && this.form.role !== 'EMPLOYEE'
  }

  /**
   * Handle role change - reset designation when role changes
   */
  onRoleChange(): void {
    this.form.designation = null
    console.log('Role changed to:', this.form.role, 'Available designations:', this.availableDesignations)
  }

  /**
   * Validate phone number (only digits allowed)
   */
  validatePhoneNumber(event: any): void {
    const input = event.target.value
    const numbersOnly = /^[0-9]*$/
    
    if (!numbersOnly.test(input)) {
      this.phoneError = "Phone number must contain only digits"
      // Remove non-numeric characters
      this.form.phoneno = input.replace(/[^0-9]/g, '')
    } else if (input.length > 0 && input.length !== 10) {
      this.phoneError = "Phone number must be exactly 10 digits"
    } else {
      this.phoneError = ""
    }
  }

  /**
   * Validate phone number on blur
   */
  onPhoneBlur(): void {
    if (this.form.phoneno && this.form.phoneno.length !== 10) {
      this.phoneError = "Phone number must be exactly 10 digits"
    }
  }

  onClose(): void {
    this.close.emit()
    this.resetForm()
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Please fill all required fields correctly')
      return
    }
    
    const submitData: any = {
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      department: this.form.department,
      role: this.form.role,
      phoneno: this.form.phoneno.trim() // Phone is now mandatory
    }

    // Handle designation based on role
    if (this.form.role === 'ADMIN') {
      // Admin doesn't need designation, set to N/A
      submitData.designation = 'N/A'
    } else if (this.form.role === 'EMPLOYEE') {
      // Employee designation is optional, set to N/A if not provided
      submitData.designation = this.form.designation || 'N/A'
    } else {
      // For STUDENT and TEACHER, designation is required
      submitData.designation = this.form.designation
    }

    // Handle password
    if (this.form.password && this.form.password.trim()) {
      submitData.password = this.form.password.trim()
    } else {
      // Use default password if not provided
      submitData.password = 'default'
    }
    
    console.log('Submitting form data:', submitData, 'isEditMode:', this.isEditMode)
    this.submit.emit(submitData)
  }

  isFormValid(): boolean {
    // Basic validation
    const baseValid =
      this.form.name.trim() !== "" &&
      this.form.email.trim() !== "" &&
      this.isValidEmail(this.form.email) &&
      this.form.department !== null &&
      this.form.department !== "" &&
      this.form.role !== "" &&
      this.form.phoneno.trim() !== "" && // Phone is mandatory
      this.form.phoneno.length === 10 && // Must be exactly 10 digits
      /^[0-9]{10}$/.test(this.form.phoneno) // Only digits

    // Check designation based on role
    let designationValid = true
    if (this.form.role === 'STUDENT' || this.form.role === 'TEACHER') {
      // Designation is mandatory for STUDENT and TEACHER
      designationValid = this.form.designation !== null && this.form.designation !== ""
    }
    // For ADMIN and EMPLOYEE, designation is optional (will be set to N/A)

    return baseValid && designationValid
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  resetForm(): void {
    this.form = {
      name: "",
      email: "",
      password: "",
      department: null,
      designation: null,
      phoneno: "",
      role: "STUDENT",
    }
    this.phoneError = ""
  }
}