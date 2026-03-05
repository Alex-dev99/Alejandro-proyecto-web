import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = [
    { title: 'Total Alumnos', value: '0', icon: 'bi-people', color: 'primary', route: '/admin/alumnos' },
    { title: 'Profesores Activos', value: '0', icon: 'bi-person-badge', color: 'success', route: '/admin/profesores' },
    { title: 'Aulas Disponibles', value: '0', icon: 'bi-building', color: 'info', route: '/admin/aulas' },
    { title: 'Pagos Pendientes', value: '0', icon: 'bi-exclamation-triangle', color: 'warning', route: '/admin/recibos' }
  ];

  recentAlumnos: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getAlumnos().subscribe({
      next: (data: any[]) => {
        this.stats[0].value = data.length.toString();
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const dateA = new Date(a.fecha_alta || 0).getTime();
            const dateB = new Date(b.fecha_alta || 0).getTime();
            return dateB - dateA;
          });
          this.recentAlumnos = sorted.slice(0, 3).map(a => ({
            nombre: `${a.nombre} ${a.apellidos || ''}`.trim(),
            curso: a.curso_actual || '-',
            fecha: a.fecha_alta ? a.fecha_alta.split(' ')[0] : ''
          }));
        }
      },
      error: (err) => console.error('Error fetching alumnos', err)
    });

    this.apiService.getProfesores().subscribe({
      next: (data: any[]) => {
        const activos = data.filter(p => p.activo == 1 || p.activo === true || p.activo === '1').length;
        this.stats[1].value = activos.toString();
      },
      error: (err) => console.error('Error fetching profesores', err)
    });

    this.apiService.getAulas().subscribe({
      next: (data: any[]) => {
        this.stats[2].value = data.length.toString();
      },
      error: (err) => console.error('Error fetching aulas', err)
    });

    this.apiService.getRecibos().subscribe({
      next: (data: any[]) => {
        const pendientes = data.filter(r => r.estado && r.estado.toUpperCase() === 'PENDIENTE').length;
        this.stats[3].value = pendientes.toString();
      },
      error: (err) => console.error('Error fetching recibos', err)
    });
  }
}