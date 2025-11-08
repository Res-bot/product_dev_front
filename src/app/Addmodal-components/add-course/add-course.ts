import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-add-course-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./add-course.html",
  styleUrls: ["./add-course.scss"],
})
export class AddCourseModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() courseData: any = null;
  @Input() isEditMode = false;
  @Input() departments: any[] = [];
  @Input() teachers: any[] = [];  // Add teachers input
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  form: any = {
    name: "",
    courseCode: "",
    departmentId: null,
    credits: null,
    teacherId: null,  // Add teacherId to form
  };

  creditOptions: number[] = [1, 2, 3, 4, 5, 6];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.courseData && this.isEditMode) {
        this.form = {
          name: this.courseData.name || '',
          courseCode: this.courseData.courseCode || '',
          departmentId: this.courseData.departmentId || null,
          credits: this.courseData.credits || null,
          teacherId: this.courseData.teacherId || null  // Include teacherId in edit mode
        };
      } else {
        this.resetForm();
      }
    }
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.submit.emit({ ...this.form });
    }
  }

  isFormValid(): boolean {
    return (
      this.form.name.trim() !== "" &&
      this.form.courseCode.trim() !== "" &&
      this.form.departmentId !== null &&
      this.form.credits !== null &&
      this.form.teacherId !== null  // Add teacherId validation
    );
  }

  resetForm(): void {
    this.form = {
      name: "",
      courseCode: "",
      departmentId: null,
      credits: null,
      teacherId: null,  // Reset teacherId
    };
  }
}