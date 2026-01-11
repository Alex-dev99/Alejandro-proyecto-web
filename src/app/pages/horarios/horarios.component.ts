import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Horario {
  id_horario: number;
  id_alumno: number;
  id_profesor: number;
  id_aula: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fecha_creacion: string;
  alumno_nombre?: string;
  profesor_nombre?: string;
  aula_nombre?: string;
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
  capacidad: number;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css']
})
export class HorariosComponent implements OnInit {
  horarios: Horario[] = [];
  alumnos: Alumno[] = [];
  profesores: Profesor[] = [];
  aulas: Aula[] = [];
  
  horarioForm: FormGroup;
  editando = false;
  horarioEditando: Horario | null = null;
  mostrarFormulario = false;
  cargando = false;
  errorCarga = '';
  cargandoDatos = false;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.horarioForm = this.fb.group({
      id_alumno: ['', [Validators.required]],
      id_profesor: ['', [Validators.required]],
      id_aula: ['', [Validators.required]],
      dia_semana: ['', [Validators.required]],
      hora_inicio: ['', [Validators.required]],
      hora_fin: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarTodosDatos();
  }

  get totalHorarios(): number {
    return this.horarios.length;
  }

  get horariosEstaSemana(): number {
    return this.horarios.length; 
  }

  cargarTodosDatos(): void {
    this.cargando = true;
    this.cargandoDatos = true;
    
    this.apiService.getHorarios().subscribe({
      next: (data) => {
        this.horarios = data;
        this.cargarDatosRelacionados();
      },
      error: (error) => {
        console.error('Error cargando horarios:', error);
        this.errorCarga = 'Error al cargar los horarios. Usando datos de ejemplo.';
        this.horarios = this.getHorariosEjemplo();
        this.cargando = false;
        this.cargandoDatos = false;
      }
    });
  }

  cargarDatosRelacionados(): void {
    this.apiService.getAlumnos().subscribe({
      next: (alumnosData) => {
        this.alumnos = alumnosData.map((a: any) => ({
          id_alumno: a.id_alumno,
          nombre: a.nombre,
          apellidos: a.apellidos
        }));
        
        this.apiService.getProfesores().subscribe({
          next: (profesoresData) => {
            this.profesores = profesoresData.map((p: any) => ({
              id_profesor: p.id_profesor,
              nombre: p.nombre,
              apellidos: p.apellidos
            }));
            
            this.apiService.getAulas().subscribe({
              next: (aulasData) => {
                this.aulas = aulasData;
                this.cargando = false;
                this.cargandoDatos = false;
              },
              error: (error) => {
                console.error('Error cargando aulas:', error);
                this.aulas = this.getAulasEjemplo();
                this.cargando = false;
                this.cargandoDatos = false;
              }
            });
          },
          error: (error) => {
            console.error('Error cargando profesores:', error);
            this.profesores = this.getProfesoresEjemplo();
            this.aulas = this.getAulasEjemplo();
            this.cargando = false;
            this.cargandoDatos = false;
          }
        });
      },
      error: (error) => {
        console.error('Error cargando alumnos:', error);
        this.alumnos = this.getAlumnosEjemplo();
        this.profesores = this.getProfesoresEjemplo();
        this.aulas = this.getAulasEjemplo();
        this.cargando = false;
        this.cargandoDatos = false;
      }
    });
  }

  private getHorariosEjemplo(): Horario[] {
    return [
      {
        id_horario: 1,
        id_alumno: 1,
        id_profesor: 1,
        id_aula: 1,
        dia_semana: 'Lunes',
        hora_inicio: '16:00',
        hora_fin: '17:00',
        fecha_creacion: '2024-01-15',
        alumno_nombre: 'Ana Sánchez',
        profesor_nombre: 'María García',
        aula_nombre: 'Aula 1'
      },
      {
        id_horario: 2,
        id_alumno: 2,
        id_profesor: 2,
        id_aula: 2,
        dia_semana: 'Martes',
        hora_inicio: '17:30',
        hora_fin: '18:30',
        fecha_creacion: '2024-01-14',
        alumno_nombre: 'Luis Fernández',
        profesor_nombre: 'Carlos Martínez',
        aula_nombre: 'Aula 2'
      }
    ];
  }

  private getAlumnosEjemplo(): Alumno[] {
    return [
      { id_alumno: 1, nombre: 'Ana', apellidos: 'Sánchez Pérez' },
      { id_alumno: 2, nombre: 'Luis', apellidos: 'Fernández Gómez' }
    ];
  }

  private getProfesoresEjemplo(): Profesor[] {
    return [
      { id_profesor: 1, nombre: 'María', apellidos: 'García López' },
      { id_profesor: 2, nombre: 'Carlos', apellidos: 'Martínez Ruiz' }
    ];
  }

  private getAulasEjemplo(): Aula[] {
    return [
      { id_aula: 1, nombre: 'Aula 1', capacidad: 5 },
      { id_aula: 2, nombre: 'Aula 2', capacidad: 4 },
      { id_aula: 3, nombre: 'Aula 3', capacidad: 6 }
    ];
  }

  getNombreCompletoAlumno(id: number): string {
    const alumno = this.alumnos.find(a => a.id_alumno === id);
    return alumno ? `${alumno.nombre} ${alumno.apellidos}` : 'N/A';
  }

  getNombreCompletoProfesor(id: number): string {
    const profesor = this.profesores.find(p => p.id_profesor === id);
    return profesor ? `${profesor.nombre} ${profesor.apellidos}` : 'N/A';
  }

  getNombreAula(id: number): string {
    const aula = this.aulas.find(a => a.id_aula === id);
    return aula ? aula.nombre : 'N/A';
  }

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
        this.apiService.updateHorario(this.horarioEditando.id_horario, horarioData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarTodosDatos(); 
                this.cancelarEdicion();
              } else {
                alert('Error al actualizar: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error actualizando horario:', error);
              alert('Error al actualizar horario. Ver consola para detalles.');
            }
          });
      } else {
        this.apiService.createHorario(horarioData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarTodosDatos(); 
                this.cancelarEdicion();
              } else {
                alert('Error al crear: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error creando horario:', error);
              alert('Error al crear horario. Ver consola para detalles.');
            }
          });
      }
    } else {
      Object.keys(this.horarioForm.controls).forEach(key => {
        this.horarioForm.get(key)?.markAsTouched();
      });
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
      this.apiService.deleteHorario(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.cargarTodosDatos(); 
            } else {
              alert('Error al eliminar: ' + response.message);
            }
          },
          error: (error) => {
            console.error('Error eliminando horario:', error);
            alert('Error al eliminar horario. Ver consola para detalles.');
          }
        });
    }
  }

  getHorariosPorDia(dia: string): Horario[] {
    return this.horarios.filter(h => h.dia_semana === dia);
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }
}