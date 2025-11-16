import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="perfil-container">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Mi Perfil</h1>
              <p class="text-muted">Información del administrador</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-4">
          <div class="card shadow text-center">
            <div class="card-body">
              <div class="mb-3">
                <i class="bi bi-person-circle display-1 text-primary"></i>
              </div>
              <h4>Administrador</h4>
              <p class="text-muted">admin@academia.com</p>
              <span class="badge bg-success">Administrador</span>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-header">
              <h5 class="mb-0">Información Personal</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre</label>
                  <input type="text" class="form-control" value="Administrador" readonly>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" value="admin@academia.com" readonly>
                </div>
                <div class="col-12 mb-3">
                  <label class="form-label">Rol</label>
                  <input type="text" class="form-control" value="Administrador" readonly>
                </div>
                <div class="col-12 mb-3">
                  <label class="form-label">Fecha de Registro</label>
                  <input type="text" class="form-control" value="2024-01-01" readonly>
                </div>
              </div>
              <button class="btn btn-primary" disabled>
                <i class="bi bi-pencil me-2"></i>
                Editar Perfil (Próximamente)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 20px;
    }
    .card {
      border: none;
      border-radius: 10px;
    }
  `]
})
export class PerfilComponent { }