import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  randomString: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Generate random string to help prevent autofill
    this.randomString = Math.random().toString(36).substring(7);
    this.initializeForm();
  }

  ngOnInit(): void {
    // Clear any autofilled values after a short delay
    setTimeout(() => {
      if (this.loginForm) {
        this.loginForm.patchValue({
          email: '',
          password: ''
        });
      }
    }, 100);

    // Check if already logged in
    // if (this.authService.isLoggedIn()) {
    //   console.log('✅ User already logged in, redirecting to dashboard');
    //   this.authService.navigateToDashboard();
    // }
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]] 
    });
  }

  onSubmit(): void {
    // Validate form
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      this.errorMessage = 'Please fill out all fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;
    console.log('🔐 Attempting login with email:', credentials.email);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        console.log('👤 User role:', response.role);
        console.log('🆔 User ID:', response.userId);
        
        this.isLoading = false;
        
        // Small delay to ensure localStorage is properly written
        setTimeout(() => {
          console.log('🚀 Navigating to dashboard...');
          this.authService.navigateToDashboard();
        }, 150);
      },
      error: (error: any) => {
        console.error('❌ Login failed:', error);
        this.isLoading = false;
        
        // Handle different error scenarios
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
      }
    });
  }

  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Getters for template access
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}