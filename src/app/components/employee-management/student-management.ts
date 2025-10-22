import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AddStudentModalComponent } from "../../add-student/add-student"
import { HttpClient } from "@angular/common/http"

@Component({
  selector: "app-student-management",
  standalone: true,
  imports: [CommonModule, FormsModule, AddStudentModalComponent],
  templateUrl: "./student-management.html",
  styleUrls: ["./student-management.scss"],
})
export class StudentManagementComponent implements OnInit {
  // Modal control
  isAddStudentModalOpen = false
  isEditMode = false
  editIndex: number | null = null

  // ID tracker
  id = 1

  // Filters
  selectedFilter = "all"
  selectedType = "all"

  // Students array with dummy data
  students: any[] = []

  // constructor(private http:HttpClient){
  //   this.getData();
  // }

  ngOnInit(): void {
    // Pre-fill dummy students
    this.students = [
      { id: this.id++, name: 'Rahul Kumar', email: 'rahul.kumar@example.com', studentId: 'S101', department: 'Computer Science', year: '2nd Year', designation: 'Intern', phoneno: '9876543210' },
      { id: this.id++, name: 'Anjali Sharma', email: 'anjali.sharma@example.com', studentId: 'S102', department: 'Electronics', year: '3rd Year', designation: 'Team Lead', phoneno: '9123456780' },
      { id: this.id++, name: 'Vikram Singh', email: 'vikram.singh@example.com', studentId: 'S103', department: 'Mechanical', year: '1st Year', designation: 'Member', phoneno: '9988776655' },
      { id: this.id++, name: 'Priya Reddy', email: 'priya.reddy@example.com', studentId: 'S104', department: 'Civil', year: '4th Year', designation: 'Coordinator', phoneno: '9871234560' },
      { id: this.id++, name: 'Arjun Das', email: 'arjun.das@example.com', studentId: 'S105', department: 'IT', year: '2nd Year', designation: 'Intern', phoneno: '9876541230' },
      { id: this.id++, name: 'Sneha Kapoor', email: 'sneha.kapoor@example.com', studentId: 'S106', department: 'Computer Science', year: '3rd Year', designation: 'Member', phoneno: '9123459870' },
      { id: this.id++, name: 'Rohan Mehta', email: 'rohan.mehta@example.com', studentId: 'S107', department: 'Electronics', year: '2nd Year', designation: 'Team Lead', phoneno: '9988112233' },
      { id: this.id++, name: 'Tanya Verma', email: 'tanya.verma@example.com', studentId: 'S108', department: 'Mechanical', year: '1st Year', designation: 'Coordinator', phoneno: '9874563210' },
      { id: this.id++, name: 'Karan Patel', email: 'karan.patel@example.com', studentId: 'S109', department: 'Civil', year: '3rd Year', designation: 'Intern', phoneno: '9123987654' },
      { id: this.id++, name: 'Isha Joshi', email: 'isha.joshi@example.com', studentId: 'S110', department: 'IT', year: '2nd Year', designation: 'Member', phoneno: '9873216540' },
    ]
  }

  // Open modal for adding a student
  onAddStudent(): void {
    this.isEditMode = false
    this.editIndex = null
    this.isAddStudentModalOpen = true
  }

  // Close modal
  onCloseModal(): void {
    this.isAddStudentModalOpen = false
    this.isEditMode = false
    this.editIndex = null
  }

  // Add or update student
  onSubmitStudent(studentData: any): void {
    // Validate that we have data
    if (!studentData || !studentData.name || !studentData.email || !studentData.studentId) {
      console.error('Invalid student data received')
      return
    }

    if (this.isEditMode && this.editIndex !== null) {
      // Update existing student - preserve the ID
      this.students[this.editIndex] = {
        id: this.students[this.editIndex].id,
        name: studentData.name,
        studentId: studentData.studentId,
        email: studentData.email,
        department: studentData.department,
        year: studentData.year,
        designation: studentData.designation || studentData.address,
        phoneno: studentData.phoneno || studentData.phone
      }
      console.log("Student updated:", this.students[this.editIndex])
      window.alert("Student successfully updated 👌")
    } else {
      // Add new student
      const newStudent = {
        id: this.id++,
        name: studentData.name,
        studentId: studentData.studentId,
        email: studentData.email,
        department: studentData.department,
        year: studentData.year,
        designation: studentData.designation || studentData.address,
        phoneno: studentData.phoneno || studentData.phone
      }
      this.students.push(newStudent)
      console.log("New student added:", newStudent)
      window.alert("Student successfully added 👌")
    }

    
    this.onCloseModal()
  }

  // Edit student
  onEdit(student: any): void {
    this.editIndex = this.students.findIndex(s => s.id === student.id)
    if (this.editIndex > -1) {
      this.isEditMode = true
      this.isAddStudentModalOpen = true
    }
  }

  // Delete student
  onDelete(student: any): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${student.name}"?`)
    if (confirmDelete) {
      this.students = this.students.filter(s => s.id !== student.id)
      console.log("Student deleted:", student)
      window.alert("Student successfully deleted")
    }
  }




  // retrive the data ---------------------------------------------------------------------
//     getData(){
//     this.http.get("http://localhost:8080/api/admin/users").subscribe((result)=>{

//       console.log(result);
//       this.students = result as any[];
//     })
//   }


//   // add the data 

//   addStudent(studentData: any): void {
//   // Map the student data to match UserDTO structure
//   const userDTO = {
//     name: studentData.name,
//     email: studentData.email,
//     password: studentData.password || 'default123', // You may want to handle password differently
//     role: 'STUDENT', // Or use UserRole enum
//     department: studentData.department,
//     designation: studentData.designation || studentData.year
//   };

//   this.http.post('http://localhost:8080/api/admin/users', userDTO).subscribe({
//     next: (result: any) => {
//       console.log('Student added successfully:', result);
//       window.alert('Student successfully added 👌');
//       this.getData(); // Refresh the list
//       this.onCloseModal();
//     },
//     error: (error) => {
//       console.error('Error adding student:', error);
//       window.alert('Error adding student: ' + (error.error?.message || error.message));
//     }
//   });
// }

//   // Update student in backend
//   updateStudent(studentId: number, studentData: any): void {
//     // Map the student data to match UserDTO structure
//     const userDTO = {
//       name: studentData.name,
//       email: studentData.email,
//       department: studentData.department,
//       designation: studentData.designation || studentData.year,
//       role: 'STUDENT'
//     };

//     // // Only include password if provided
//     // if (studentData.password && studentData.password.trim() !== '') {
//     //   (userDTO as any).password = studentData.password;
//     // }

//     this.http.put(`http://localhost:8080/api/admin/users/${studentId}`, userDTO).subscribe({
//       next: (result: any) => {
//         console.log('Student updated successfully:', result);
//         window.alert('Student successfully updated 👌');
//         this.getData(); // Refresh the list
//         this.onCloseModal();
//       },
//       error: (error) => {
//         console.error('Error updating student:', error);
//         window.alert('Error updating student: ' + (error.error?.message || error.message));
//       }
//     });
//   }

//   // Delete student from backend
//   deleteStudent(studentId: number, studentName: string): void {
//     const confirmDelete = confirm(`Are you sure you want to delete "${studentName}"?`);
//     if (confirmDelete) {
//       this.http.delete(`http://localhost:8080/api/admin/users/${studentId}`).subscribe({
//         next: () => {
//           console.log('Student deleted successfully');
//           window.alert('Student successfully deleted');
//           this.getData(); // Refresh the list
//         },
//         error: (error) => {
//           console.error('Error deleting student:', error);
//           window.alert('Error deleting student: ' + (error.error?.message || error.message));
//         }
//       });
//     }
//   }

//   // Update your existing onSubmitStudent method to use the new methods:
//   onSubmitStudent(studentData: any): void {
//     // Validate that we have data
//     if (!studentData || !studentData.name || !studentData.email) {
//       console.error('Invalid student data received');
//       window.alert('Please fill in all required fields');
//       return;
//     }

//     if (this.isEditMode && this.editIndex !== null) {
//       // Update existing student via API
//       const studentId = this.students[this.editIndex].id;
//       this.updateStudent(studentId, studentData);
//     } else {
//       // Add new student via API
//       this.addStudent(studentData);
//     }
//   }

//     // Update your existing onDelete method to use the new method:
//     onDelete(student: any): void {
//       this.deleteStudent(student.id, student.name);
//     }

}