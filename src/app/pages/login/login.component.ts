import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showDemoInfo = true;
  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Solo verificar autenticación en el navegador
    if (this.isBrowser && this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.showDemoInfo = false;

      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          
          if (response && response.success) {
            this.redirectBasedOnRole();
          } else {
            this.errorMessage = response?.message || 'Error en la autenticación';
            this.showDemoInfo = true;
          }
        },
        error: (error) => {
          this.loading = false;
          this.showDemoInfo = true;
          this.handleError(error);
        }
      });
      
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    
    if (user.administrador === true || user.rol === 'PROFESOR') {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.rol === 'ALUMNO') {
      this.router.navigate(['/alumno/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private handleError(error: any): void {
    console.error('Error en login:', error);
    
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('Código: 0') || errorMessage.includes('Unknown Error')) {
      this.errorMessage = 'Error de conexión. Verifica que:';
      this.errorMessage += '<br>1. XAMPP esté iniciado (Apache y MySQL)';
      this.errorMessage += '<br>2. La API esté accesible en: http://localhost/backend/api/';
    } else if (errorMessage.includes('Código: 401') || errorMessage.includes('401')) {
      this.errorMessage = 'Email o contraseña incorrectos';
    } else if (errorMessage.includes('Código: 404') || errorMessage.includes('404')) {
      this.errorMessage = 'Servicio no encontrado';
    } else {
      this.errorMessage = 'Error al iniciar sesión';
    }
  }

  get email() { 
    return this.loginForm.get('email'); 
  }
  
  get password() { 
    return this.loginForm.get('password'); 
  }
}
// ← AQUÍ CIERRA LA CLASE - Fíjate que tienes esta línea