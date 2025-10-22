import { Component } from '@angular/core';
import { AddStudentModalComponent } from '../../add-student/add-student';
import { AddCourseModalComponent } from '../../add-course/add-course';
import { AddDepartmentModalComponent } from '../../add-department/add-department';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [AddStudentModalComponent,AddCourseModalComponent,AddDepartmentModalComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

  // modal bydefaultly false 
  isAddStudentModalOpen = false
  isAddCourseModalOpen = false;
  isAddDepartmentModalOpen = false;


  // sample arrays to hold data
  students: any[] = [];
  courses: any[] = [];
  departments: any[] = [];


  // add , close , and submit methods 
  onAddStudent(): void {
    this.isAddStudentModalOpen = true;
  }

  onCloseModal() {
  this.isAddStudentModalOpen = false;
  this.isAddCourseModalOpen = false;
  this.isAddDepartmentModalOpen = false;
  }



  onSubmitStudent(newStudent: any) {
    this.students.push({
      // id: this.students.length + 1,
      name: newStudent.name,
      roll: newStudent.studentId,
      department: newStudent.department,
      year: newStudent.year,
      status: 'Present'
    });
    this.isAddStudentModalOpen = false;
  }
  

// functions to call and close the course field 

  onAddcourse(): void {
    this.isAddCourseModalOpen = true;
  }

  onSubmitCourse(courseData: any) {
      this.courses.push({
      id: this.courses.length + 1,
      name: courseData.name,
      code: courseData.code,
      department: courseData.department,
      credits: courseData.credits
    });    

      console.log("Course submitted:", courseData)
      this.onCloseModal()

  }

  // close and submit methods for department field

  onAdddepartment(): void {
    this.isAddDepartmentModalOpen = true;
  }

  onSubmitDepartment(departmentData: any) {
      this.departments.push({
      id: this.departments.length + 1,
      name: departmentData.name,
      head: departmentData.head,
      contact: departmentData.contact
    });

      console.log("Department submitted:", departmentData)
      this.onCloseModal()
  }

}
