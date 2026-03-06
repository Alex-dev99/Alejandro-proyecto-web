import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage(): void {
    try {
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        console.log('Usuario cargado desde sessionStorage:', user.nombre);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearAllStorage();
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.login({ email, password }).pipe(
      tap({
        next: (response) => {
          if (response.success && response.usuario) {
            console.log('Login exitoso:', response.usuario);
            this.saveUserToStorage(response.usuario);
            this.currentUserSubject.next(response.usuario);

            setTimeout(() => {
              if (response.usuario.administrador === 1 || response.usuario.administrador === true) {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/profesor/dashboard']);
              }
            }, 100);
          }
        },
        error: (error) => {
          console.error('AuthService login error:', error);
        }
      })
    );
  }

  private saveUserToStorage(user: any): void {
    try {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('token', 'dummy-token-' + Date.now()); 
      sessionStorage.setItem('userRole', user.administrador ? 'admin' : 'teacher');
      console.log('Usuario guardado en sessionStorage');
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  logout(): void {
    console.log('Ejecutando logout...');

    const currentUser = this.getCurrentUser();
    console.log('Usuario actual antes de logout:', currentUser?.nombre);

    this.clearAllStorage();

    this.currentUserSubject.next(null);

    console.log('Storage limpiado');
    console.log('Verificando después de limpiar:');
    console.log('currentUser en sessionStorage:', sessionStorage.getItem('currentUser'));
    console.log('currentUser en BehaviorSubject:', this.currentUserSubject.value);

    setTimeout(() => {
      console.log('Redirigiendo a login...');
      this.router.navigate(['/login']).then(success => {
        if (success) {
          console.log('Redirección exitosa');
          window.location.reload();
        } else {
          console.error('Falló la redirección');
          window.location.href = '/login';
        }
      });
    }, 100);
  }

  private clearAllStorage(): void {
    if (!this.isBrowser) return;

    try {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userRole');

      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');

      this.clearAuthCookies();

      console.log('Todos los datos de sesión eliminados');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  private clearAuthCookies(): void {
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('auth') || name.includes('token') || name.includes('session')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    const isLogged = user !== null;
    console.log('Verificación de login - Usuario:', user?.nombre, 'Está logueado:', isLogged);
    return isLogged;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    const isAdmin = user && (user.administrador === 1 || user.administrador === true);
    console.log('Verificación de admin - Usuario:', user?.nombre, 'Es admin:', isAdmin);
    return isAdmin;
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    return user ? user.nombre : '';
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return user.administrador === 1 || user.administrador === true ? 'admin' : 'teacher';
  }

  updateUserData(updatedUser: any): void {
    if (updatedUser) {
      this.saveUserToStorage(updatedUser);
      this.currentUserSubject.next(updatedUser);
      console.log('🔄 Datos de usuario actualizados');
    }
  }
}