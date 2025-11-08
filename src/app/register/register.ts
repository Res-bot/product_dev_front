import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['STUDENT', Validators.required],
      department: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
  if (this.registerForm.invalid) {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.authService.register(this.registerForm.value).subscribe({
    next: (response: any) => {
      console.log('Registration successful:', response);
      this.isLoading = false;
      // Navigate to login page after successful registration
      this.router.navigate(['/login']);
    },
    error: (error: any) => {  // ← Add type annotation here
      console.error('Registration failed:', error);
      this.isLoading = false;
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
    }
  });
}
}