import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Profesor {
  id_profesor: number;
  nombre: string;
  apellidos: string;
  alias: string;
  fecha_nacimiento: string;
  materias_imparte: string;
  email: string;
  cuenta_bancaria: string;
  activo: boolean;
  administrador: boolean;
  password: string;
}

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profesores.component.html',
  styleUrls: ['./profesores.component.css']
})
export class ProfesoresComponent implements OnInit {
  profesores: Profesor[] = [];
  profesorForm: FormGroup;
  editando = false;
  profesorEditando: Profesor | null = null;
  mostrarFormulario = false;
  mostrarPassword = false;
  cargando = false;
  errorCarga = '';

  materias = ['Matemáticas', 'Inglés', 'Francés', 'Física', 'Química', 'Lengua', 'Historia', 'Biología'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.profesorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      alias: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      materias_imparte: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cuenta_bancaria: ['', [Validators.required, Validators.minLength(20)]],
      administrador: [false],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.cargarProfesores();
  }

  get totalProfesores(): number {
    return this.profesores.length;
  }

  get profesoresActivos(): number {
    return this.profesores.filter(p => p.activo).length;
  }

  get totalMaterias(): number {
    const todasMaterias = this.profesores.flatMap(p => p.materias_imparte.split(','));
    return new Set(todasMaterias).size;
  }

  get profesoresAdministradores(): number {
    return this.profesores.filter(p => p.administrador).length;
  }

  cargarProfesores(): void {
    this.cargando = true;
    this.errorCarga = '';
    
    this.apiService.getProfesores().subscribe({
      next: (data) => {
        this.profesores = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando profesores:', error);
        this.errorCarga = 'Error al cargar los profesores. Usando datos de ejemplo.';
        this.profesores = this.getDatosEjemplo();
        this.cargando = false;
      }
    });
  }

  private getDatosEjemplo(): Profesor[] {
    return [
      {
        id_profesor: 1,
        nombre: 'María',
        apellidos: 'García López',
        alias: 'María',
        fecha_nacimiento: '1985-03-15',
        materias_imparte: 'Matemáticas,Física',
        email: 'maria@academia.com',
        cuenta_bancaria: 'ES9121000418450200051332',
        activo: true,
        administrador: true,
        password: 'hashed_pass_1'
      },
      {
        id_profesor: 2,
        nombre: 'Carlos',
        apellidos: 'Martínez Ruiz',
        alias: 'Carlos',
        fecha_nacimiento: '1990-07-22',
        materias_imparte: 'Inglés,Francés',
        email: 'carlos@academia.com',
        cuenta_bancaria: 'ES7921000813530200051332',
        activo: true,
        administrador: false,
        password: 'hashed_pass_2'
      }
    ];
  }

  nuevoProfesor(): void {
    this.editando = false;
    this.profesorEditando = null;
    this.profesorForm.reset({ administrador: false });
    this.mostrarFormulario = true;
    this.mostrarPassword = false;
    
    this.profesorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.profesorForm.get('password')?.updateValueAndValidity();
  }

  editarProfesor(profesor: Profesor): void {
    this.editando = true;
    this.profesorEditando = profesor;
    this.profesorForm.patchValue({
      nombre: profesor.nombre,
      apellidos: profesor.apellidos,
      alias: profesor.alias,
      fecha_nacimiento: profesor.fecha_nacimiento,
      materias_imparte: profesor.materias_imparte,
      email: profesor.email,
      cuenta_bancaria: profesor.cuenta_bancaria,
      administrador: profesor.administrador,
      password: ''
    });
    this.mostrarFormulario = true;
    this.mostrarPassword = false;
    
    this.profesorForm.get('password')?.clearValidators();
    this.profesorForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.profesorForm.get('password')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  guardarProfesor(): void {
    if (this.profesorForm.valid) {
      const profesorData = this.profesorForm.value;
      
      if (this.editando && this.profesorEditando) {
        this.apiService.updateProfesor(this.profesorEditando.id_profesor, profesorData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarProfesores(); 
                this.cancelarEdicion();
              } else {
                alert('Error al actualizar: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error actualizando profesor:', error);
              alert('Error al actualizar profesor. Ver consola para detalles.');
            }
          });
      } else {
        const nuevoProfesor: Profesor = {
          id_profesor: 0, 
          ...profesorData,
          activo: true
        };
        
        this.apiService.createProfesor(nuevoProfesor)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarProfesores(); 
                this.cancelarEdicion();
              } else {
                alert('Error al crear: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error creando profesor:', error);
              alert('Error al crear profesor. Ver consola para detalles.');
            }
          });
      }
    } else {
      Object.keys(this.profesorForm.controls).forEach(key => {
        this.profesorForm.get(key)?.markAsTouched();
      });
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.profesorEditando = null;
    this.profesorForm.reset();
    this.mostrarPassword = false;
  }

  toggleActivo(profesor: Profesor): void {
    const profesorActualizado = { ...profesor, activo: !profesor.activo };
    
    this.apiService.updateProfesor(profesor.id_profesor, profesorActualizado)
      .subscribe({
        next: (response) => {
          if (response.success) {
            profesor.activo = !profesor.activo;
          } else {
            alert('Error al cambiar estado: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          alert('Error al cambiar estado del profesor');
        }
      });
  }

  eliminarProfesor(id: number): void {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      this.apiService.deleteProfesor(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.cargarProfesores(); 
            } else {
              alert('Error al eliminar: ' + response.message);
            }
          },
          error: (error) => {
            console.error('Error eliminando profesor:', error);
            alert('Error al eliminar profesor. Ver consola para detalles.');
          }
        });
    }
  }

  getMateriasArray(materias: string): string[] {
    return materias.split(',').map(m => m.trim());
  }
}