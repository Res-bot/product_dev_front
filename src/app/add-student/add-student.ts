import { Component, EventEmitter, Input, Output, type OnChanges, type SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface StudentForm {
  name: string
  email: string
  studentId: string
  department: string
  year: string
  phone: string
  address: string
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
  @Input() studentData: StudentForm | null = null

  @Output() close = new EventEmitter<void>()
  @Output() submit = new EventEmitter<StudentForm>()

  form: StudentForm = {
    name: "",
    email: "",
    studentId: "",
    department: "",
    year: "",
    phone: "",
    address: "",
    role: "",
  }

  departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Engineering", "Business"]

  years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
  roles = ["Student", "Teacher", "Admin"]

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !this.isOpen) {
      this.resetForm()
      return
    }


    if (changes["studentData"] && this.studentData && this.isEditMode) {
      this.form = {
        name: this.studentData.name || "",
        email: this.studentData.email || "",
        studentId: this.studentData.studentId || "",
        department: this.studentData.department || "",
        year: this.studentData.year || "",
        phone: this.studentData.phone || "",
        address: this.studentData.address || "",
        role: this.studentData.role || "",
      }
    }
  }

  onClose(): void {
    this.close.emit()
    this.resetForm()
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.submit.emit(this.form)

      if (!this.isEditMode) {
        this.resetForm()
      }

      this.onClose()
    }
  }

  isFormValid(): boolean {
    const baseValid =
      this.form.name.trim() !== "" &&
      this.form.email.trim() !== "" &&
      this.form.studentId.trim() !== "" &&
      this.form.department !== "" &&
      this.form.year !== "" &&
      this.form.phone.trim() !== "" &&
      this.form.role !== ""

    if (this.form.role === "Teacher" || this.form.role === "Admin") {
      return baseValid && this.form.address.trim() !== ""
    }

    return baseValid
  }

  resetForm(): void {
    this.form = {
      name: "",
      email: "",
      studentId: "",
      department: "",
      year: "",
      phone: "",
      address: "",
      role: "",
    }
  }
}
