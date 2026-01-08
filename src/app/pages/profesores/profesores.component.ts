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

  profesorForm: FormGroup;
  editando = false;
  profesorEditando: Profesor | null = null;
  mostrarFormulario = false;
  mostrarPassword = false; 

  materias = ['Matemáticas', 'Inglés', 'Francés', 'Física', 'Química', 'Lengua', 'Historia', 'Biología'];

  constructor(private fb: FormBuilder) {
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

  
  get profesoresAdministradores(): number {
    return this.profesores.filter(p => p.administrador).length;
  }

  
  nuevoProfesor(): void {
    this.editando = false;
    this.profesorEditando = null;
    this.profesorForm.reset({ administrador: false }); // Reset con valor por defecto
    this.mostrarFormulario = true;
    this.mostrarPassword = false;
    
    // Password es obligatorio al crear
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
      administrador: profesor.administrador,  // ← NUEVO
      password: ''  // ← NUEVO: no mostramos el password actual por seguridad
    });
    this.mostrarFormulario = true;
    this.mostrarPassword = false;
    
    // ← NUEVO: Password es opcional al editar
    this.profesorForm.get('password')?.clearValidators();
    this.profesorForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.profesorForm.get('password')?.updateValueAndValidity();
  }

  // ← NUEVO: Toggle para mostrar/ocultar password
  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  guardarProfesor(): void {
    if (this.profesorForm.valid) {
      const profesorData = this.profesorForm.value;

      if (this.editando && this.profesorEditando) {
        // Actualizar profesor existente
        const index = this.profesores.findIndex(p => p.id_profesor === this.profesorEditando!.id_profesor);
        
        // ← NUEVO: Si el password está vacío al editar, mantener el anterior
        if (!profesorData.password) {
          profesorData.password = this.profesorEditando.password;
        }
        
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
        
        // ⚠️ IMPORTANTE: En producción, aquí deberías hashear el password antes de guardarlo
        // Ejemplo: nuevoProfesor.password = await bcrypt.hash(profesorData.password, 10);
        
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
    this.mostrarPassword = false;
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