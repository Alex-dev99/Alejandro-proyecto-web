import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profesores.component.html',
  styleUrls: ['./profesores.component.css']
})
export class ProfesoresComponent {
  profesores: Profesor[] = [
    {
      id_profesor: 1,
      nombre: 'María',
      apellidos: 'García López',
      alias: 'María',
      fecha_nacimiento: '1985-03-15',
      materias_imparte: 'Matemáticas,Física',
      email: 'maria@academia.com',
      cuenta_bancaria: 'ES9121000418450200051332',
      activo: true
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
      activo: true
    }
  ];

  profesorForm: FormGroup;
  editando = false;
  profesorEditando: Profesor | null = null;
  mostrarFormulario = false;

  materias = ['Matemáticas', 'Inglés', 'Francés', 'Física', 'Química', 'Lengua', 'Historia', 'Biología'];

  constructor(private fb: FormBuilder) {
    this.profesorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      alias: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      materias_imparte: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cuenta_bancaria: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  // Propiedades calculadas
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

  // CRUD Operations
  nuevoProfesor(): void {
    this.editando = false;
    this.profesorEditando = null;
    this.profesorForm.reset();
    this.mostrarFormulario = true;
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
      cuenta_bancaria: profesor.cuenta_bancaria
    });
    this.mostrarFormulario = true;
  }

  guardarProfesor(): void {
    if (this.profesorForm.valid) {
      const profesorData = this.profesorForm.value;

      if (this.editando && this.profesorEditando) {
        // Actualizar profesor existente
        const index = this.profesores.findIndex(p => p.id_profesor === this.profesorEditando!.id_profesor);
        this.profesores[index] = {
          ...this.profesorEditando,
          ...profesorData
        };
      } else {
        // Crear nuevo profesor
        const nuevoProfesor: Profesor = {
          id_profesor: Math.max(...this.profesores.map(p => p.id_profesor)) + 1,
          ...profesorData,
          activo: true
        };
        this.profesores.push(nuevoProfesor);
      }

      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.profesorEditando = null;
    this.profesorForm.reset();
  }

  toggleActivo(profesor: Profesor): void {
    profesor.activo = !profesor.activo;
  }

  eliminarProfesor(id: number): void {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      this.profesores = this.profesores.filter(p => p.id_profesor !== id);
    }
  }

  // Helper para mostrar materias como badges
  getMateriasArray(materias: string): string[] {
    return materias.split(',');
  }
}