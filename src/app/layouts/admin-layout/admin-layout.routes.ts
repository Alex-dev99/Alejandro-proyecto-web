import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';

export const ADMIN_LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('../../pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'alumnos', 
        loadComponent: () => import('../../pages/alumnos/alumnos.component').then(m => m.AlumnosComponent)
      },
      { 
        path: 'profesores', 
        loadComponent: () => import('../../pages/profesores/profesores.component').then(m => m.ProfesoresComponent)
      },
      { 
        path: 'aulas', 
        loadComponent: () => import('../../pages/aulas/aulas.component').then(m => m.AulasComponent)
      },
      { 
        path: 'horarios', 
        loadComponent: () => import('../../pages/horarios/horarios.component').then(m => m.HorariosComponent)
      },
      { 
        path: 'recibos', 
        loadComponent: () => import('../../pages/recibos/recibos.component').then(m => m.RecibosComponent)
      },
      { 
        path: 'perfil', 
        loadComponent: () => import('../../pages/perfil/perfil.component').then(m => m.PerfilComponent)
      }
    ]
  }
];