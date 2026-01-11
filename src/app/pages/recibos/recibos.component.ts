import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Recibo {
  id_recibo: number;
  id_alumno: number;
  mes: string;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADO';
  fecha_emision: string;
  fecha_pago: string | null;
  alumno_nombre?: string; 
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
export class RecibosComponent implements OnInit {
  recibos: Recibo[] = [];
  alumnos: Alumno[] = [];
  reciboForm: FormGroup;
  editando = false;
  reciboEditando: Recibo | null = null;
  mostrarFormulario = false;
  cargando = false;
  errorCarga = '';

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  anos = ['2024', '2025', '2026'];
  estados = ['PENDIENTE', 'PAGADO'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.reciboForm = this.fb.group({
      id_alumno: ['', [Validators.required]],
      mes: ['', [Validators.required]],
      importe: ['', [Validators.required, Validators.min(0)]],
      estado: ['PENDIENTE', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.errorCarga = '';
    
    this.apiService.getRecibos().subscribe({
      next: (recibosData) => {
        this.recibos = recibosData;
        
        this.apiService.getAlumnos().subscribe({
          next: (alumnosData) => {
            this.alumnos = alumnosData.filter((a: any) => a.activo);
            this.cargando = false;
          },
          error: (alumnoError) => {
            console.error('Error cargando alumnos:', alumnoError);
            this.alumnos = [];
            this.cargando = false;
          }
        });
      },
      error: (reciboError) => {
        console.error('Error cargando recibos:', reciboError);
        this.errorCarga = 'Error al cargar los recibos. Usando datos de ejemplo.';
        this.recibos = this.getDatosEjemplo();
        this.alumnos = this.getAlumnosEjemplo();
        this.cargando = false;
      }
    });
  }

  private getDatosEjemplo(): Recibo[] {
    return [
      {
        id_recibo: 1,
        id_alumno: 1,
        mes: 'Noviembre 2024',
        importe: 120.00,
        estado: 'PAGADO',
        fecha_emision: '2024-11-01',
        fecha_pago: '2024-11-05 10:30:00',
        alumno_nombre: 'Ana Sánchez'
      },
      {
        id_recibo: 2,
        id_alumno: 1,
        mes: 'Diciembre 2024',
        importe: 120.00,
        estado: 'PENDIENTE',
        fecha_emision: '2024-12-01',
        fecha_pago: null,
        alumno_nombre: 'Ana Sánchez'
      }
    ];
  }

  private getAlumnosEjemplo(): Alumno[] {
    return [
      { id_alumno: 1, nombre: 'Ana', apellidos: 'Sánchez Pérez', cuota_mensual: 120.00 },
      { id_alumno: 2, nombre: 'Luis', apellidos: 'Fernández Gómez', cuota_mensual: 100.00 }
    ];
  }

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

  getNombreAlumno(id: number): string {
    const alumno = this.alumnos.find(a => a.id_alumno === id);
    return alumno ? `${alumno.nombre} ${alumno.apellidos}` : `Alumno #${id}`;
  }

  getCuotaAlumno(id: number): number {
    const alumno = this.alumnos.find(a => a.id_alumno === id);
    return alumno ? alumno.cuota_mensual : 0;
  }

  getMesesCompletos(): string[] {
    const mesesCompletos: string[] = [];
    this.anos.forEach(ano => {
      this.meses.forEach(mes => {
        mesesCompletos.push(`${mes} ${ano}`);
      });
    });
    return mesesCompletos;
  }

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

  onAlumnoChange(): void {
    const alumnoId = this.reciboForm.get('id_alumno')?.value;
    if (alumnoId && !this.editando) {
      const cuota = this.getCuotaAlumno(alumnoId);
      if (cuota > 0) {
        this.reciboForm.patchValue({ importe: cuota });
      }
    }
  }

  marcarComoPagado(recibo: Recibo): void {
    if (confirm('¿Marcar este recibo como pagado?')) {
      const reciboActualizado = { 
        ...recibo, 
        estado: 'PAGADO',
        fecha_pago: new Date().toISOString()
      };
      
      this.apiService.updateRecibo(recibo.id_recibo, reciboActualizado)
        .subscribe({
          next: (response) => {
            if (response.success) {
              recibo.estado = 'PAGADO';
              recibo.fecha_pago = reciboActualizado.fecha_pago;
              this.cargarDatos(); 
            } else {
              alert('Error al marcar como pagado: ' + response.message);
            }
          },
          error: (error) => {
            console.error('Error marcando como pagado:', error);
            alert('Error al marcar recibo como pagado');
          }
        });
    }
  }

  guardarRecibo(): void {
    if (this.reciboForm.valid) {
      const reciboData = this.reciboForm.value;

      if (this.editando && this.reciboEditando) {
        this.apiService.updateRecibo(this.reciboEditando.id_recibo, reciboData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarDatos(); 
                this.cancelarEdicion();
              } else {
                alert('Error al actualizar: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error actualizando recibo:', error);
              alert('Error al actualizar recibo. Ver consola para detalles.');
            }
          });
      } else {
        const nuevoRecibo: Recibo = {
          id_recibo: 0, 
          ...reciboData,
          fecha_emision: new Date().toISOString().split('T')[0],
          fecha_pago: reciboData.estado === 'PAGADO' ? new Date().toISOString() : null,
          alumno_nombre: this.getNombreAlumno(reciboData.id_alumno)
        };
        
        this.apiService.createRecibo(nuevoRecibo)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.cargarDatos(); 
                this.cancelarEdicion();
              } else {
                alert('Error al crear: ' + response.message);
              }
            },
            error: (error) => {
              console.error('Error creando recibo:', error);
              alert('Error al crear recibo. Ver consola para detalles.');
            }
          });
      }
    } else {
      Object.keys(this.reciboForm.controls).forEach(key => {
        this.reciboForm.get(key)?.markAsTouched();
      });
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.reciboEditando = null;
    this.reciboForm.reset({ estado: 'PENDIENTE' });
  }

  eliminarRecibo(id: number): void {
    if (confirm('¿Estás seguro de eliminar este recibo?')) {
      this.apiService.deleteRecibo(id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.cargarDatos(); 
            } else {
              alert('Error al eliminar: ' + response.message);
            }
          },
          error: (error) => {
            console.error('Error eliminando recibo:', error);
            alert('Error al eliminar recibo. Ver consola para detalles.');
          }
        });
    }
  }

  getRecibosPorEstado(estado: string): Recibo[] {
    return this.recibos.filter(r => r.estado === estado);
  }
}