import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface Horario {
  id_horario: number;
  id_alumno: number;
  id_profesor: number;
  id_aula: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fecha_creacion: string;
}

interface Alumno {
  id_alumno: number;
  nombre: string;
  apellidos: string;
}

interface Profesor {
  id_profesor: number;
  nombre: string;
  apellidos: string;
}

interface Aula {
  id_aula: number;
  nombre: string;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css']
})
export class HorariosComponent {
  // Datos de ejemplo
  alumnos: Alumno[] = [
    { id_alumno: 1, nombre: 'Ana', apellidos: 'Sánchez Pérez' },
    { id_alumno: 2, nombre: 'Luis', apellidos: 'Fernández Gómez' },
    { id_alumno: 3, nombre: 'María', apellidos: 'Rodríguez López' }
  ];

  profesores: Profesor[] = [
    { id_profesor: 1, nombre: 'María', apellidos: 'García López' },
    { id_profesor: 2, nombre: 'Carlos', apellidos: 'Martínez Ruiz' }
  ];

  aulas: Aula[] = [
    { id_aula: 1, nombre: 'Aula 1' },
    { id_aula: 2, nombre: 'Aula 2' },
    { id_aula: 3, nombre: 'Aula 3' }
  ];

  horarios: Horario[] = [
    {
      id_horario: 1,
      id_alumno: 1,
      id_profesor: 1,
      id_aula: 1,
      dia_semana: 'Lunes',
      hora_inicio: '16:00',
      hora_fin: '17:00',
      fecha_creacion: '2024-01-15'
    },
    {
      id_horario: 2,
      id_alumno: 1,
      id_profesor: 1,
      id_aula: 1,
      dia_semana: 'Miércoles',
      hora_inicio: '16:00',
      hora_fin: '17:00',
      fecha_creacion: '2024-01-15'
    },
    {
      id_horario: 3,
      id_alumno: 2,
      id_profesor: 2,
      id_aula: 2,
      dia_semana: 'Martes',
      hora_inicio: '17:30',
      hora_fin: '18:30',
      fecha_creacion: '2024-01-14'
    }
  ];

  horarioForm: FormGroup;
  editando = false;
  horarioEditando: Horario | null = null;
  mostrarFormulario = false;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(private fb: FormBuilder) {
    this.horarioForm = this.fb.group({
      id_alumno: ['', [Validators.required]],
      id_profesor: ['', [Validators.required]],
      id_aula: ['', [Validators.required]],
      dia_semana: ['', [Validators.required]],
      hora_inicio: ['', [Validators.required]],
      hora_fin: ['', [Validators.required]]
    });
  }

  // Propiedades calculadas
  get totalHorarios(): number {
    return this.horarios.length;
  }

  get horariosEstaSemana(): number {
    return this.horarios.length; // Simplificado para el ejemplo
  }

  // Helper methods
  getNombreAlumno(id: number): string {
    const alumno = this.alumnos.find(a => a.id_alumno === id);
    return alumno ? `${alumno.nombre} ${alumno.apellidos}` : 'N/A';
  }

  getNombreProfesor(id: number): string {
    const profesor = this.profesores.find(p => p.id_profesor === id);
    return profesor ? `${profesor.nombre} ${profesor.apellidos}` : 'N/A';
  }

  getNombreAula(id: number): string {
    const aula = this.aulas.find(a => a.id_aula === id);
    return aula ? aula.nombre : 'N/A';
  }

  // CRUD Operations
  nuevoHorario(): void {
    this.editando = false;
    this.horarioEditando = null;
    this.horarioForm.reset();
    this.mostrarFormulario = true;
  }

  editarHorario(horario: Horario): void {
    this.editando = true;
    this.horarioEditando = horario;
    this.horarioForm.patchValue({
      id_alumno: horario.id_alumno,
      id_profesor: horario.id_profesor,
      id_aula: horario.id_aula,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin
    });
    this.mostrarFormulario = true;
  }

  guardarHorario(): void {
    if (this.horarioForm.valid) {
      const horarioData = this.horarioForm.value;

      if (this.editando && this.horarioEditando) {
        // Actualizar horario existente
        const index = this.horarios.findIndex(h => h.id_horario === this.horarioEditando!.id_horario);
        this.horarios[index] = {
          ...this.horarioEditando,
          ...horarioData
        };
      } else {
        // Crear nuevo horario
        const nuevoHorario: Horario = {
          id_horario: Math.max(...this.horarios.map(h => h.id_horario)) + 1,
          ...horarioData,
          fecha_creacion: new Date().toISOString().split('T')[0]
        };
        this.horarios.push(nuevoHorario);
      }

      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.horarioEditando = null;
    this.horarioForm.reset();
  }

  eliminarHorario(id: number): void {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
      this.horarios = this.horarios.filter(h => h.id_horario !== id);
    }
  }

  // Vista semanal simplificada
  getHorariosPorDia(dia: string): Horario[] {
    return this.horarios.filter(h => h.dia_semana === dia);
  }
}