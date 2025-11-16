import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true, // <-- Asegúrate que tiene standalone
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      // Simulación de login
      setTimeout(() => {
        this.loading = false;
        const { email, password } = this.loginForm.value;
        
        if (email === 'admin@academia.com' && password === 'admin123') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Credenciales incorrectas';
        }
      }, 1500);
      
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Getters para el template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}