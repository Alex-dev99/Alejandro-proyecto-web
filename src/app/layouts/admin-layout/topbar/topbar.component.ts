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
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.updateUserInfo();
    
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
    
    this.authService.logout();
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.nombre : 'Administrador';
  }

  getUserRole(): string {
    return this.authService.isAdmin() ? 'Administrador' : 'Profesor';
  }
}