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
  errorType: 'inactive' | 'insufficient_permissions' | 'connection_error' | 'invalid_credentials' | 'not_found' | 'unknown_error' | '' = '';
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
    if (this.isBrowser && this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.errorType = '';
      this.showDemoInfo = false;

      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          
          if (response && response.success) {
            this.redirectBasedOnRole();
          } else {
            this.errorMessage = response?.message || 'Error en la autenticación';
            this.errorType = response?.type || 'error';
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
    
    if (user.administrador === true || user.administrador === 1) {
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
      this.errorType = 'connection_error';
      this.errorMessage = '🔌 Error de conexión. Verifica que:\n';
      this.errorMessage += '1. XAMPP esté iniciado (Apache y MySQL)\n';
      this.errorMessage += '2. La API esté accesible en: http://localhost/proyectoFinal/Alejandro-proyecto-web/backend/api/';
    } else if (errorMessage.includes('Código: 403') || errorMessage.includes('403')) {
      this.errorType = 'insufficient_permissions';
      this.errorMessage = 'Acceso denegado';
    } else if (errorMessage.includes('Código: 401') || errorMessage.includes('401')) {
      this.errorType = 'invalid_credentials';
      this.errorMessage = 'Email o contraseña incorrectos';
    } else if (errorMessage.includes('Código: 404') || errorMessage.includes('404')) {
      this.errorType = 'not_found';
      this.errorMessage = 'Servicio no encontrado';
    } else {
      this.errorType = 'unknown_error';
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
