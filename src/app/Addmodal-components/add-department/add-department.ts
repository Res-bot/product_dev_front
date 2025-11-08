import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-add-department-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./add-department.html",
  styleUrls: ["./add-department.scss"],
})
export class AddDepartmentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() departmentData: any = null;
  @Input() isEditMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  form: any = {
    name: "",
    description: ""
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.departmentData && this.isEditMode) {
        this.form = {
          name: this.departmentData.name || '',
          description: this.departmentData.description || ''
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
      this.form.name.trim() !== ""
    );
  }

  resetForm(): void {
    this.form = {
      name: "",
      description: ""
    };
  }
}