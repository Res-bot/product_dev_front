import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AddCourseModalComponent } from "../../add-course/add-course"

interface Course {
  id: number
  courseName: string
  courseCode: string
  department: string
  credits: string
  instructor: string
}

@Component({
  selector: "app-course-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AddCourseModalComponent],
  templateUrl: "./course-management.html",
  styleUrls: ["./course-management.scss"],
})
export class CourseManagementComponent implements OnInit {
  isAddCourseModalOpen = false
  isEditMode = false
  editIndex: number | null = null

  // ID tracker for proper ID generation
  private nextId = 3

  // Array of courses with proper typing
  courses: Course[] = [
    { 
      id: 1, 
      courseName: "Data Structures", 
      courseCode: "CS101", 
      department: "Computer Science", 
      credits: "4 Credits", 
      instructor: "Dr. Ramesh Kumar" 
    },
    { 
      id: 2, 
      courseName: "Database Systems", 
      courseCode: "CS102", 
      department: "Computer Science", 
      credits: "3 Credits", 
      instructor: "Prof. Anjali Singh" 
    }
  ]

  constructor() {}

  ngOnInit(): void {}

  // Open modal for adding course
  onAddcourse(): void {
    this.isEditMode = false
    this.editIndex = null
    this.isAddCourseModalOpen = true
  }

  // Close modal
  onCloseModal(): void {
    this.isAddCourseModalOpen = false
    this.isEditMode = false
    this.editIndex = null
  }

  // Add or update course
  onSubmitCourse(courseData: any): void {
    // Validate that we have data
    if (!courseData || !courseData.courseName || !courseData.courseCode || 
        !courseData.department || !courseData.credits || !courseData.instructor) {
      console.error('Invalid course data received')
      return
    }

    if (this.isEditMode && this.editIndex !== null) {
      // Update existing course - preserve the ID
      this.courses[this.editIndex] = {
        id: this.courses[this.editIndex].id,
        courseName: courseData.courseName,
        courseCode: courseData.courseCode,
        department: courseData.department,
        credits: courseData.credits,
        instructor: courseData.instructor
      }
      console.log("Course updated:", this.courses[this.editIndex])
      window.alert("Course successfully updated 👌")
    } else {
      // Add new course with proper ID
      const newCourse: Course = {
        id: this.nextId++,
        courseName: courseData.courseName,
        courseCode: courseData.courseCode,
        department: courseData.department,
        credits: courseData.credits,
        instructor: courseData.instructor
      }
      this.courses.push(newCourse)
      console.log("New course added:", newCourse)
      window.alert("Course successfully added 👌")
    }

    // Close modal and reset state
    this.onCloseModal()
  }

  // Edit a course
  onEdit(course: Course): void {
    this.editIndex = this.courses.findIndex(c => c.id === course.id)
    if (this.editIndex > -1) {
      this.isEditMode = true
      this.isAddCourseModalOpen = true
    }
  }

  // Delete a course
  onDelete(course: Course): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${course.courseName}"?`)
    if (confirmDelete) {
      this.courses = this.courses.filter(c => c.id !== course.id)
      console.log("Course deleted:", course)
      window.alert("Course successfully deleted")
    }
  }
}