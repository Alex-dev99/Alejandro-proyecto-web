import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // Datos de ejemplo - después conectarás con tu API
  stats = [
    { title: 'Total Alumnos', value: '25', icon: 'bi-people', color: 'primary', route: '/admin/alumnos' },
    { title: 'Profesores Activos', value: '8', icon: 'bi-person-badge', color: 'success', route: '/admin/profesores' },
    { title: 'Aulas Disponibles', value: '6', icon: 'bi-building', color: 'info', route: '/admin/aulas' },
    { title: 'Pagos Pendientes', value: '3', icon: 'bi-exclamation-triangle', color: 'warning', route: '/admin/recibos' }
  ];

  recentAlumnos = [
    { nombre: 'Ana Sánchez', curso: '2º Bachillerato', fecha: '2024-01-15' },
    { nombre: 'Luis Fernández', curso: '4º ESO', fecha: '2024-01-14' },
    { nombre: 'María Rodríguez', curso: '1º Bachillerato', fecha: '2024-01-13' }
  ];
}