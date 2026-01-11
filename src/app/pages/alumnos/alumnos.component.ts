import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Alumno {
  id_alumno: number;
  nombre: string;
  apellidos: string;
  email: string;
  curso_actual: string;
  materia: string;
  cuota_mensual: number;
  metodo_pago: string;
  fecha_alta: string;
  activo: boolean;
  password: string;
}

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumnos: Alumno[] = [];
  alumnoForm: FormGroup;
  editando = false;
  alumnoEditando: Alumno | null = null;
  mostrarFormulario = false;
  mostrarPassword = false;
  cargando = false;
  errorCarga = '';

  metodosPago = ['Efectivo', 'Tarjeta', 'Transferencia', 'Bizum'];
  cursos = ['1º ESO', '2º ESO', '3º ESO', '4º ESO', '1º Bachillerato', '2º Bachillerato'];
  materias = ['Matemáticas', 'Inglés', 'Lengua', 'Física', 'Química', 'Historia'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.alumnoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      curso_actual: ['', [Validators.required]],
      materia: ['', [Validators.required]],
      cuota_mensual: ['', [Validators.required, Validators.min(0)]],
      metodo_pago: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  get totalAlumnos(): number {
    return this.alumnos.length;
  }

  get alumnosActivos(): number {
    return this.alumnos.filter(a => a.activo).length;
  }

  get ingresoMensual(): number {
    return this.alumnos
      .filter(a => a.activo)
      .reduce((total, alumno) => total + alumno.cuota_mensual, 0);
  }

  cargarAlumnos(): void {
    this.cargando = true;
    this.errorCarga = '';
    
    this.apiService.getAlumnos().subscribe({
      next: (data) => {
        this.alumnos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando alumnos:', error);
        this.errorCarga = 'Error al cargar los alumnos. Usando datos de ejemplo.';
        this.alumnos = this.getDatosEjemplo();
        this.cargando = false;
      }
    });
  }

  private getDatosEjemplo(): Alumno[] {
    return [
      {
        id_alumno: 1,
        nombre: 'Ana',
        apellidos: 'Sánchez Pérez',
        email: 'ana@email.com',
        curso_actual: '2º Bachillerato',
        materia: 'Matemáticas',
        cuota_mensual: 120.00,
        metodo_pago: 'Transferencia',
        fecha_alta: '2024-01-15',
        activo: true,
        password: 'hashed_pass_alumno_1'
      },
      {
        id_alumno: 2,
        nombre: 'Luis',
        apellidos: 'Fernández Gómez',
        email: 'luis@email.com',
        curso_actual: '4º ESO',
        materia: 'Inglés',
        cuota_mensual: 100.00,
        metodo_pago: 'Efectivo',
        fecha_alta: '2024-01-14',
        activo: true,
        password: 'hashed_pass_alumno_2'
      }
    ];
  }

  nuevoAlumno(): void {
    this.editando = false;
    this.alumnoEditando = null;
    this.alumnoForm.reset();
    this.mostrarFormulario = true;
    this.mostrarPassword = false;
    
    this.alumnoForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.alumnoForm.get('password')?.updateValueAndValidity();
  }

  editarAlumno(alumno: Alumno): void {
    this.editando = true;
    this.alumnoEditando = alumno;
    this.alumnoForm.patchValue({
      nombre: alumno.nombre,
      apellidos: alumno.apellidos,
      email: alumno.email,
      curso_actual: alumno.curso_actual,
      materia: alumno.materia,
      cuota_mensual: alumno.cuota_mensual,
      metodo_pago: alumno.metodo_pago,
      password: ''
    });
    this.mostrarFormulario = true;
    this.mostrarPassword = false;
    
    this.alumnoForm.get('password')?.clearValidators();
    this.alumnoForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.alumnoForm.get('password')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  guardarAlumno(): void {
    if (this.alumnoForm.valid) {
      const alumnoData = this.alumnoForm.value;
      
      if (this.editando && this.alumnoEditando) {
        this.apiService.updateAlumno(this.alumnoEditando.id_alumno, alumnoData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarAlumnos(); 
                this.cancelarEdicion();
              } else {
                alert('Error al actualizar: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error actualizando alumno:', error);
              alert('Error al actualizar alumno. Ver consola para detalles.');
            }
          });
      } else {
        const nuevoAlumno: Alumno = {
          id_alumno: 0, 
          ...alumnoData,
          fecha_alta: new Date().toISOString().split('T')[0],
          activo: true
        };
        
        this.apiService.createAlumno(nuevoAlumno)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarAlumnos(); 
                this.cancelarEdicion();
              } else {
                alert('Error al crear: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error creando alumno:', error);
              alert('Error al crear alumno. Ver consola para detalles.');
            }
          });
      }
    } else {
      Object.keys(this.alumnoForm.controls).forEach(key => {
        this.alumnoForm.get(key)?.markAsTouched();
      });
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.alumnoEditando = null;
    this.alumnoForm.reset();
    this.mostrarPassword = false;
  }

  toggleActivo(alumno: Alumno): void {
    const alumnoActualizado = { ...alumno, activo: !alumno.activo };
    
    this.apiService.updateAlumno(alumno.id_alumno, alumnoActualizado)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alumno.activo = !alumno.activo;
          } else {
            alert('Error al cambiar estado: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          alert('Error al cambiar estado del alumno');
        }
      });
  }

  eliminarAlumno(id: number): void {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.apiService.deleteAlumno(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.cargarAlumnos(); 
            } else {
              alert('Error al eliminar: ' + response.message);
            }
          },
          error: (error) => {
            console.error('Error eliminando alumno:', error);
            alert('Error al eliminar alumno. Ver consola para detalles.');
          }
        });
    }
  }
}