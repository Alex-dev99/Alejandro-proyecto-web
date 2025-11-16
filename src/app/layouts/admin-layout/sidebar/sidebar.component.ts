import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuItems = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/alumnos', icon: 'bi-people', label: 'Alumnos' },
    { path: '/admin/profesores', icon: 'bi-person-badge', label: 'Profesores' },
    { path: '/admin/aulas', icon: 'bi-building', label: 'Aulas' },
    { path: '/admin/horarios', icon: 'bi-calendar', label: 'Horarios' },
    { path: '/admin/recibos', icon: 'bi-receipt', label: 'Recibos' }
  ];

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}