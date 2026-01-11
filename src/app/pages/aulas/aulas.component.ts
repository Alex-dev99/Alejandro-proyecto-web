import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

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
export class AulasComponent implements OnInit {
  aulas: Aula[] = [];
  aulaForm: FormGroup;
  editando = false;
  aulaEditando: Aula | null = null;
  mostrarFormulario = false;
  cargando = false;
  errorCarga = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.aulaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarAulas();
  }

  get totalAulas(): number {
    return this.aulas.length;
  }

  get capacidadTotal(): number {
    return this.aulas.reduce((total, aula) => total + aula.capacidad, 0);
  }

  cargarAulas(): void {
    this.cargando = true;
    this.errorCarga = '';
    
    this.apiService.getAulas().subscribe({
      next: (data) => {
        this.aulas = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando aulas:', error);
        this.errorCarga = 'Error al cargar las aulas. Usando datos de ejemplo.';
        this.aulas = this.getDatosEjemplo();
        this.cargando = false;
      }
    });
  }

  private getDatosEjemplo(): Aula[] {
    return [
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
  }

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
        const aulaActualizada = { ...aulaData };
        
        const index = this.aulas.findIndex(a => a.id_aula === this.aulaEditando!.id_aula);
        this.aulas[index] = {
          ...this.aulaEditando,
          ...aulaActualizada
        };
        
        this.cancelarEdicion();
      } else {
        
        const nuevaAula: Aula = {
          id_aula: Math.max(...this.aulas.map(a => a.id_aula)) + 1,
          ...aulaData
        };
        
        this.aulas.push(nuevaAula);
        this.cancelarEdicion();
      }
    } else {
      Object.keys(this.aulaForm.controls).forEach(key => {
        this.aulaForm.get(key)?.markAsTouched();
      });
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

  getIconoCapacidad(capacidad: number): string {
    if (capacidad <= 3) return 'bi-people';
    if (capacidad <= 5) return 'bi-people-fill';
    return 'bi-people';
  }
}