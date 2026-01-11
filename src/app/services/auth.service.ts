import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.apiService.login({ email, password }).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.setItem('currentUser', JSON.stringify(response.usuario));
            this.currentUserSubject.next(response.usuario);
            observer.next(response);
            observer.complete();
          } else {
            observer.error(new Error(response.message));
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && (user.rol === 'ADMIN' || user.administrador === true);
  }
}