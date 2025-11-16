import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface Aula {
  id_aula: number;
  nombre: string;
  capacidad: number;
  descripcion: string;
}

@Component({
  selector: 'app-aulas',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './aulas.component.html',
  styleUrls: ['./aulas.component.css']
})
export class AulasComponent {
  aulas: Aula[] = [
    {
      id_aula: 1,
      nombre: 'Aula 1',
      capacidad: 5,
      descripcion: 'Aula principal con pizarra digital'
    },
    {
      id_aula: 2,
      nombre: 'Aula 2',
      capacidad: 4,
      descripcion: 'Aula pequeña para clases individuales'
    },
    {
      id_aula: 3,
      nombre: 'Aula 3',
      capacidad: 6,
      descripcion: 'Aula de informática'
    }
  ];

  aulaForm: FormGroup;
  editando = false;
  aulaEditando: Aula | null = null;
  mostrarFormulario = false;

  constructor(private fb: FormBuilder) {
    this.aulaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required]]
    });
  }

  // Propiedades calculadas
  get totalAulas(): number {
    return this.aulas.length;
  }

  get capacidadTotal(): number {
    return this.aulas.reduce((total, aula) => total + aula.capacidad, 0);
  }

  // CRUD Operations
  nuevaAula(): void {
    this.editando = false;
    this.aulaEditando = null;
    this.aulaForm.reset();
    this.mostrarFormulario = true;
  }

  editarAula(aula: Aula): void {
    this.editando = true;
    this.aulaEditando = aula;
    this.aulaForm.patchValue({
      nombre: aula.nombre,
      capacidad: aula.capacidad,
      descripcion: aula.descripcion
    });
    this.mostrarFormulario = true;
  }

  guardarAula(): void {
    if (this.aulaForm.valid) {
      const aulaData = this.aulaForm.value;

      if (this.editando && this.aulaEditando) {
        // Actualizar aula existente
        const index = this.aulas.findIndex(a => a.id_aula === this.aulaEditando!.id_aula);
        this.aulas[index] = {
          ...this.aulaEditando,
          ...aulaData
        };
      } else {
        // Crear nueva aula
        const nuevaAula: Aula = {
          id_aula: Math.max(...this.aulas.map(a => a.id_aula)) + 1,
          ...aulaData
        };
        this.aulas.push(nuevaAula);
      }

      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.aulaEditando = null;
    this.aulaForm.reset();
  }

  eliminarAula(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta aula?')) {
      this.aulas = this.aulas.filter(a => a.id_aula !== id);
    }
  }

  // Helper para mostrar estado de capacidad
  getEstadoCapacidad(capacidad: number): string {
    if (capacidad <= 3) return 'Pequeña';
    if (capacidad <= 5) return 'Mediana';
    return 'Grande';
  }

  getColorCapacidad(capacidad: number): string {
    if (capacidad <= 3) return 'bg-info';
    if (capacidad <= 5) return 'bg-success';
    return 'bg-warning';
  }
}