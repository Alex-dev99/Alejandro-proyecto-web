import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from "../../../services/auth.service"; // Ajusta esta ruta según tu estructura

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  // Variables para mostrar en la plantilla
  userName: string = 'Administrador';
  isLoggedIn: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService // Añade el AuthService aquí
  ) {}

  ngOnInit(): void {
    // Inicializar con los datos del usuario actual
    this.updateUserInfo();
    
    // Suscribirse a cambios en el usuario
    this.authService.currentUser$.subscribe(user => {
      this.updateUserInfo();
    });
  }

  private updateUserInfo(): void {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userName = user ? user.nombre : 'Administrador';
    console.log('👤 Usuario actualizado en Topbar:', this.userName, 'Logueado:', this.isLoggedIn);
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    console.log('👤 Usuario hace clic en cerrar sesión');
    console.log('🔍 Estado actual - Logueado:', this.authService.isLoggedIn(), 'Usuario:', this.authService.getCurrentUser()?.nombre);
    
    // Usar el AuthService para logout
    this.authService.logout();
  }

  // Métodos auxiliares para la plantilla
  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.nombre : 'Administrador';
  }

  getUserRole(): string {
    return this.authService.isAdmin() ? 'Administrador' : 'Profesor';
  }
}