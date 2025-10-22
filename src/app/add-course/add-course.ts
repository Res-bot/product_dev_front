import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface CourseForm {
  courseName: string
  courseCode: string
  department: string
  credits: string
  instructor: string
}

interface CourseData {
  id: number
  courseName: string
  courseCode: string
  department: string
  credits: string
  instructor: string
}

@Component({
  selector: "app-add-course-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./add-course.html",
  styleUrls: ["./add-course.scss"],
})
export class AddCourseModalComponent implements OnChanges {
  @Input() isOpen = false
  @Input() courseData: CourseData | null = null
  @Input() isEditMode = false
  @Output() close = new EventEmitter<void>()
  @Output() submit = new EventEmitter<CourseForm>()

  form: CourseForm = {
    courseName: "",
    courseCode: "",
    department: "",
    credits: "",
    instructor: "",
  }

  departments: string[] = [
    "Computer Science", 
    "Mathematics", 
    "Physics", 
    "Chemistry", 
    "Biology", 
    "Engineering", 
    "Business"
  ]

  credits: string[] = [
    "1 Credit", 
    "2 Credits", 
    "3 Credits", 
    "4 Credits", 
    "5 Credits", 
    "6 Credits"
  ]

  instructors: string[] = [
    "Prof. Smith",
    "Prof. Johnson",
    "Prof. Williams",
    "Prof. Brown",
    "Prof. Davis",
    "Prof. Miller",
    "Prof. Wilson",
    "Dr. Ramesh Kumar",
    "Prof. Anjali Singh"
  ]

  ngOnChanges(changes: SimpleChanges): void {
    // Only update form when modal opens
    if (changes['isOpen'] && this.isOpen) {
      if (this.courseData && this.isEditMode) {
        // Map course data to form structure for editing
        this.form = {
          courseName: this.courseData.courseName || '',
          courseCode: this.courseData.courseCode || '',
          department: this.courseData.department || '',
          credits: this.courseData.credits || '',
          instructor: this.courseData.instructor || ''
        }
      } else {
        // Reset form for adding new course
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
      const formData: CourseForm = { ...this.form }
      this.submit.emit(formData)
      // Don't call onClose here - let parent handle closing
    }
  }

  isFormValid(): boolean {
    return (
      this.form.courseName.trim() !== "" &&
      this.form.courseCode.trim() !== "" &&
      this.form.department.trim() !== "" &&
      this.form.credits.trim() !== "" &&
      this.form.instructor.trim() !== ""
    )
  }

  resetForm(): void {
    this.form = {
      courseName: "",
      courseCode: "",
      department: "",
      credits: "",
      instructor: "",
    }
  }
}