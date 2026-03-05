import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    loadChildren: () => import('./layouts/admin-layout/admin-layout.routes').then(m => m.ADMIN_LAYOUT_ROUTES),
    canActivate: [authGuard],
    data: { requiresAdmin: true }
  },
  {
    path: 'profesor',
    loadChildren: () => import('./layouts/admin-layout/admin-layout.routes').then(m => m.ADMIN_LAYOUT_ROUTES),
    canActivate: [authGuard],
    data: { requiresAdmin: false }
  },
  { path: '**', redirectTo: '/login' }
];