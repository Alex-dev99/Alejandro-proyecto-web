import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface Recibo {
  id_recibo: number;
  id_alumno: number;
  mes: string;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADO';
  fecha_emision: string;
  fecha_pago: string | null;
}

interface Alumno {
  id_alumno: number;
  nombre: string;
  apellidos: string;
  cuota_mensual: number;
}

@Component({
  selector: 'app-recibos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './recibos.component.html',
  styleUrls: ['./recibos.component.css']
})
export class RecibosComponent {
  // Datos de ejemplo
  alumnos: Alumno[] = [
    { id_alumno: 1, nombre: 'Ana', apellidos: 'Sánchez Pérez', cuota_mensual: 120.00 },
    { id_alumno: 2, nombre: 'Luis', apellidos: 'Fernández Gómez', cuota_mensual: 100.00 },
    { id_alumno: 3, nombre: 'María', apellidos: 'Rodríguez López', cuota_mensual: 110.00 }
  ];

  recibos: Recibo[] = [
    {
      id_recibo: 1,
      id_alumno: 1,
      mes: 'Noviembre 2024',
      importe: 120.00,
      estado: 'PAGADO',
      fecha_emision: '2024-11-01',
      fecha_pago: '2024-11-05'
    },
    {
      id_recibo: 2,
      id_alumno: 1,
      mes: 'Diciembre 2024',
      importe: 120.00,
      estado: 'PENDIENTE',
      fecha_emision: '2024-12-01',
      fecha_pago: null
    },
    {
      id_recibo: 3,
      id_alumno: 2,
      mes: 'Noviembre 2024',
      importe: 100.00,
      estado: 'PAGADO',
      fecha_emision: '2024-11-01',
      fecha_pago: '2024-11-06'
    }
  ];

  reciboForm: FormGroup;
  editando = false;
  reciboEditando: Recibo | null = null;
  mostrarFormulario = false;

  meses = [
    'Enero 2024', 'Febrero 2024', 'Marzo 2024', 'Abril 2024', 
    'Mayo 2024', 'Junio 2024', 'Julio 2024', 'Agosto 2024',
    'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024'
  ];

  constructor(private fb: FormBuilder) {
    this.reciboForm = this.fb.group({
      id_alumno: ['', [Validators.required]],
      mes: ['', [Validators.required]],
      importe: ['', [Validators.required, Validators.min(0)]],
      estado: ['PENDIENTE', [Validators.required]]
    });
  }

  // Propiedades calculadas
  get totalRecibos(): number {
    return this.recibos.length;
  }

  get recibosPagados(): number {
    return this.recibos.filter(r => r.estado === 'PAGADO').length;
  }

  get ingresosTotales(): number {
    return this.recibos
      .filter(r => r.estado === 'PAGADO')
      .reduce((total, recibo) => total + recibo.importe, 0);
  }

  get pendienteCobro(): number {
    return this.recibos
      .filter(r => r.estado === 'PENDIENTE')
      .reduce((total, recibo) => total + recibo.importe, 0);
  }

  // Helper methods
  getNombreAlumno(id: number): string {
    const alumno = this.alumnos.find(a => a.id_alumno === id);
    return alumno ? `${alumno.nombre} ${alumno.apellidos}` : 'N/A';
  }

  getCuotaAlumno(id: number): number {
    const alumno = this.alumnos.find(a => a.id_alumno === id);
    return alumno ? alumno.cuota_mensual : 0;
  }

  // CRUD Operations
  nuevoRecibo(): void {
    this.editando = false;
    this.reciboEditando = null;
    this.reciboForm.reset({ estado: 'PENDIENTE' });
    this.mostrarFormulario = true;
  }

  editarRecibo(recibo: Recibo): void {
    this.editando = true;
    this.reciboEditando = recibo;
    this.reciboForm.patchValue({
      id_alumno: recibo.id_alumno,
      mes: recibo.mes,
      importe: recibo.importe,
      estado: recibo.estado
    });
    this.mostrarFormulario = true;
  }

  guardarRecibo(): void {
    if (this.reciboForm.valid) {
      const reciboData = this.reciboForm.value;

      if (this.editando && this.reciboEditando) {
        // Actualizar recibo existente
        const index = this.recibos.findIndex(r => r.id_recibo === this.reciboEditando!.id_recibo);
        this.recibos[index] = {
          ...this.reciboEditando,
          ...reciboData,
          fecha_pago: reciboData.estado === 'PAGADO' ? new Date().toISOString().split('T')[0] : null
        };
      } else {
        // Crear nuevo recibo
        const nuevoRecibo: Recibo = {
          id_recibo: Math.max(...this.recibos.map(r => r.id_recibo)) + 1,
          ...reciboData,
          fecha_emision: new Date().toISOString().split('T')[0],
          fecha_pago: reciboData.estado === 'PAGADO' ? new Date().toISOString().split('T')[0] : null
        };
        this.recibos.push(nuevoRecibo);
      }

      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.reciboEditando = null;
    this.reciboForm.reset({ estado: 'PENDIENTE' });
  }

  marcarComoPagado(recibo: Recibo): void {
    if (confirm('¿Marcar este recibo como pagado?')) {
      recibo.estado = 'PAGADO';
      recibo.fecha_pago = new Date().toISOString().split('T')[0];
    }
  }

  eliminarRecibo(id: number): void {
    if (confirm('¿Estás seguro de eliminar este recibo?')) {
      this.recibos = this.recibos.filter(r => r.id_recibo !== id);
    }
  }

  // Auto-completar importe cuando se selecciona alumno
  onAlumnoChange(): void {
    const alumnoId = this.reciboForm.get('id_alumno')?.value;
    if (alumnoId && !this.editando) {
      const cuota = this.getCuotaAlumno(alumnoId);
      this.reciboForm.patchValue({ importe: cuota });
    }
  }
}