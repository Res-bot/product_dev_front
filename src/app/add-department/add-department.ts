import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface DepartmentForm {
  name: string
  code: string
  head: string
}

interface DepartmentData {
  id: number
  name: string
  code: string
  head: string
}

@Component({
  selector: "app-add-department-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./add-department.html",
  styleUrls: ["./add-department.scss"],
})
export class AddDepartmentModalComponent implements OnChanges {
  @Input() isOpen = false
  @Input() departmentData: DepartmentData | null = null
  @Input() isEditMode = false
  @Output() close = new EventEmitter<void>()
  @Output() submit = new EventEmitter<DepartmentForm>()

  form: DepartmentForm = {
    name: "",
    code: "",
    head: "",
  }

  departmentHeads = [
    "Dr. John Smith",
    "Prof. Sarah Johnson",
    "Dr. Michael Chen",
    "Prof. Emily Davis",
    "Dr. David Wilson",
    "Prof. Jessica Brown",
    "Dr. Rakesh Kumar",
    "Prof. Sneha Nair",
    "Dr. Manoj Patra",
    "Prof. Ankit Singh",
    "Dr. Priya Das"
  ]

  ngOnChanges(changes: SimpleChanges): void {
    // Only update form when modal opens
    if (changes['isOpen'] && this.isOpen) {
      if (this.departmentData && this.isEditMode) {
        // Map department data to form structure for editing
        this.form = {
          name: this.departmentData.name || '',
          code: this.departmentData.code || '',
          head: this.departmentData.head || ''
        }
      } else {
        // Reset form for adding new department
        this.resetForm()
      }
    }
  }

  onClose(): void {
    this.resetForm()
    this.close.emit()
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      // Create a copy of the form data to emit
      const formData = { ...this.form }
      this.submit.emit(formData)
      // Don't call onClose here - let parent handle closing
    }
  }

  isFormValid(): boolean {
    return (
      this.form.name.trim() !== "" && 
      this.form.code.trim() !== "" && 
      this.form.head.trim() !== ""
    )
  }

  resetForm(): void {
    this.form = {
      name: "",
      code: "",
      head: "",
    }
  }
}