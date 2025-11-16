import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent {
  alumnos: Alumno[] = [
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
      activo: true
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
      activo: true
    }
  ];

  alumnoForm: FormGroup;
  editando = false;
  alumnoEditando: Alumno | null = null;
  mostrarFormulario = false;

  metodosPago = ['Efectivo', 'Tarjeta', 'Transferencia', 'Bizum'];
  cursos = ['1º ESO', '2º ESO', '3º ESO', '4º ESO', '1º Bachillerato', '2º Bachillerato'];
  materias = ['Matemáticas', 'Inglés', 'Lengua', 'Física', 'Química', 'Historia'];

  constructor(private fb: FormBuilder) {
    this.alumnoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      curso_actual: ['', [Validators.required]],
      materia: ['', [Validators.required]],
      cuota_mensual: ['', [Validators.required, Validators.min(0)]],
      metodo_pago: ['', [Validators.required]]
    });
  }

  // Propiedades calculadas
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

  // CRUD Operations
  nuevoAlumno(): void {
    this.editando = false;
    this.alumnoEditando = null;
    this.alumnoForm.reset();
    this.mostrarFormulario = true;
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
      metodo_pago: alumno.metodo_pago
    });
    this.mostrarFormulario = true;
  }

  guardarAlumno(): void {
    if (this.alumnoForm.valid) {
      const alumnoData = this.alumnoForm.value;

      if (this.editando && this.alumnoEditando) {
        // Actualizar alumno existente
        const index = this.alumnos.findIndex(a => a.id_alumno === this.alumnoEditando!.id_alumno);
        this.alumnos[index] = {
          ...this.alumnoEditando,
          ...alumnoData
        };
      } else {
        // Crear nuevo alumno
        const nuevoAlumno: Alumno = {
          id_alumno: Math.max(...this.alumnos.map(a => a.id_alumno)) + 1,
          ...alumnoData,
          fecha_alta: new Date().toISOString().split('T')[0],
          activo: true
        };
        this.alumnos.push(nuevoAlumno);
      }

      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.alumnoEditando = null;
    this.alumnoForm.reset();
  }

  toggleActivo(alumno: Alumno): void {
    alumno.activo = !alumno.activo;
  }

  eliminarAlumno(id: number): void {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnos = this.alumnos.filter(a => a.id_alumno !== id);
    }
  }
}