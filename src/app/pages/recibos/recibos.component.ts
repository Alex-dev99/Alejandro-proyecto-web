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
  activo: boolean;
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
  
  anos: string[] = [];
  estados = ['PENDIENTE', 'PAGADO'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.reciboForm = this.fb.group({
      id_alumno: ['', [Validators.required]],
      mes: ['', [Validators.required]],
      ano: ['', [Validators.required]],
      importe: ['', [Validators.required, Validators.min(0)]],
      estado: ['PENDIENTE', [Validators.required]]
    });
    
    this.inicializarAnos();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private inicializarAnos(): void {
    const currentYear = new Date().getFullYear();
    for (let i = -2; i <= 2; i++) {
      this.anos.push((currentYear + i).toString());
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.errorCarga = '';
    
    this.apiService.getRecibos().subscribe({
      next: (recibosData: any) => {
        console.log('📊 Recibos cargados:', recibosData);
        
        if (Array.isArray(recibosData)) {
          this.recibos = recibosData.map((recibo: any) => {
            const estado = recibo.estado === 'PAGADO' ? 'PAGADO' as 'PAGADO' : 'PENDIENTE' as 'PENDIENTE';
            
            return {
              id_recibo: recibo.id_recibo || recibo.id,
              id_alumno: recibo.id_alumno,
              mes: recibo.mes || this.obtenerMesActual(),
              importe: recibo.importe || 0,
              estado: estado,
              fecha_emision: recibo.fecha_emision || new Date().toISOString().split('T')[0],
              fecha_pago: recibo.fecha_pago || null,
              alumno_nombre: recibo.alumno_nombre || recibo.nombre_alumno || ''
            };
          });
        } else {
          console.error('Los recibos no son un array:', recibosData);
          this.recibos = [];
        }
        
        this.cargarAlumnos();
      },
      error: (reciboError) => {
        console.error('Error cargando recibos:', reciboError);
        this.errorCarga = 'Error al cargar los recibos. Verifica la conexión con el servidor.';
        this.recibos = [];
        this.cargando = false;
      }
    });
  }

  private cargarAlumnos(): void {
    this.apiService.getAlumnos().subscribe({
      next: (alumnosData: any) => {
        console.log('Alumnos cargados:', alumnosData);
        
        if (Array.isArray(alumnosData)) {
          this.alumnos = alumnosData.map((alumno: any) => ({
            id_alumno: alumno.id_alumno || alumno.id,
            nombre: alumno.nombre || '',
            apellidos: alumno.apellidos || '',
            cuota_mensual: alumno.cuota_mensual || 0,
            activo: alumno.activo !== undefined ? alumno.activo : true
          }));
        } else {
          console.error('Los alumnos no son un array:', alumnosData);
          this.alumnos = [];
        }
        
        this.cargando = false;
        this.vincularNombresAlumnos();
      },
      error: (alumnoError) => {
        console.error('Error cargando alumnos:', alumnoError);
        this.alumnos = [];
        this.cargando = false;
      }
    });
  }

  private vincularNombresAlumnos(): void {
    this.recibos.forEach(recibo => {
      const alumno = this.alumnos.find(a => a.id_alumno === recibo.id_alumno);
      if (alumno) {
        recibo.alumno_nombre = `${alumno.nombre} ${alumno.apellidos}`;
      }
    });
  }

  private obtenerMesActual(): string {
    const fecha = new Date();
    const mes = fecha.getMonth();
    const ano = fecha.getFullYear();
    return `${this.meses[mes]} ${ano}`;
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
    .reduce((total, recibo) => {
      const importeNumero = typeof recibo.importe === 'string' 
        ? parseFloat(recibo.importe) 
        : recibo.importe;
      
      return total + (importeNumero || 0);
    }, 0);
}

get pendienteCobro(): number {
  return this.recibos
    .filter(r => r.estado === 'PENDIENTE')
    .reduce((total, recibo) => {
      const importeNumero = typeof recibo.importe === 'string' 
        ? parseFloat(recibo.importe) 
        : recibo.importe;
      
      return total + (importeNumero || 0);
    }, 0);
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
    
    const mesActual = new Date().getMonth();
    const anoActual = new Date().getFullYear().toString();
    
    this.reciboForm.reset({
      mes: this.meses[mesActual],
      ano: anoActual,
      estado: 'PENDIENTE',
      importe: 0
    });
    
    this.mostrarFormulario = true;
  }

  editarRecibo(recibo: Recibo): void {
    this.editando = true;
    this.reciboEditando = recibo;
    
    const [mes, ano] = recibo.mes.split(' ');
    
    this.reciboForm.patchValue({
      id_alumno: recibo.id_alumno,
      mes: mes || '',
      ano: ano || new Date().getFullYear().toString(),
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

  onMesAnoChange(): void {
    if (!this.editando) {
      const alumnoId = this.reciboForm.get('id_alumno')?.value;
      const mes = this.reciboForm.get('mes')?.value;
      const ano = this.reciboForm.get('ano')?.value;
      
      if (alumnoId && mes && ano) {
        const mesCompleto = `${mes} ${ano}`;
        const existeRecibo = this.recibos.some(r => 
          r.id_alumno === alumnoId && r.mes === mesCompleto
        );
        
        if (existeRecibo) {
          alert('Ya existe un recibo para este alumno en el mes seleccionado.');
        }
      }
    }
  }

  marcarComoPagado(recibo: Recibo): void {
    if (confirm('¿Marcar este recibo como pagado?')) {
      const fechaPago = new Date().toISOString().split('T')[0] + ' ' + 
                       new Date().toTimeString().split(' ')[0];
      
      const reciboActualizado = { 
        ...recibo, 
        estado: 'PAGADO' as 'PAGADO',
        fecha_pago: fechaPago
      };
      
      this.apiService.updateRecibo(recibo.id_recibo, reciboActualizado)
        .subscribe({
          next: (response: any) => {
            console.log('✅ Respuesta al marcar como pagado:', response);
            
            if (response.success || response.affected_rows > 0) {
              const index = this.recibos.findIndex(r => r.id_recibo === recibo.id_recibo);
              if (index !== -1) {
                this.recibos[index] = { 
                  ...this.recibos[index], 
                  estado: 'PAGADO' as 'PAGADO',
                  fecha_pago: fechaPago 
                };
              }
              
              this.cargarDatos();
            } else {
              alert('Error al marcar como pagado');
            }
          },
          error: (error) => {
            console.error('Error marcando como pagado:', error);
            alert('Error al marcar recibo como pagado. Ver consola para detalles.');
          }
        });
    }
  }

  guardarRecibo(): void {
    if (this.reciboForm.valid) {
      const formData = this.reciboForm.value;
      
      const estado = formData.estado === 'PAGADO' ? 'PAGADO' as 'PAGADO' : 'PENDIENTE' as 'PENDIENTE';
      
      const reciboData = {
        ...formData,
        mes: `${formData.mes} ${formData.ano}`,
        estado: estado
      };
      
      delete reciboData.ano;

      if (this.editando && this.reciboEditando) {
        this.apiService.updateRecibo(this.reciboEditando.id_recibo, reciboData)
          .subscribe({
            next: (response: any) => {
              console.log('Respuesta de actualización:', response);
              
              if (response.success || response.affected_rows > 0) {
                this.cargarDatos();
                this.cancelarEdicion();
                alert('Recibo actualizado correctamente');
              } else {
                alert('Error al actualizar recibo');
              }
            },
            error: (error) => {
              console.error('Error actualizando recibo:', error);
              alert('Error al actualizar recibo. Ver consola para detalles.');
            }
          });
      } else {
        const fechaPago = estado === 'PAGADO' ? 
          new Date().toISOString().split('T')[0] + ' ' + 
          new Date().toTimeString().split(' ')[0] : null;
        
        const nuevoRecibo: any = {
          ...reciboData,
          fecha_emision: new Date().toISOString().split('T')[0],
          fecha_pago: fechaPago
        };
        
        this.apiService.createRecibo(nuevoRecibo)
          .subscribe({
            next: (response: any) => {
              console.log('Respuesta de creación:', response);
              
              if (response.success) {
                this.cargarDatos();
                this.cancelarEdicion();
                alert('Recibo creado correctamente');
              } else {
                alert('Error al crear recibo: ' + (response.message || ''));
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
        const control = this.reciboForm.get(key);
        control?.markAsTouched();
        
        if (control?.invalid) {
          console.log(`Campo ${key} inválido:`, control.errors);
        }
      });
      
      alert('Por favor, completa todos los campos requeridos correctamente.');
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.reciboEditando = null;
    this.reciboForm.reset({
      estado: 'PENDIENTE'
    });
  }

  eliminarRecibo(id: number): void {
    if (confirm('¿Estás seguro de eliminar este recibo? Esta acción no se puede deshacer.')) {
      this.apiService.deleteRecibo(id)
        .subscribe({
          next: (response: any) => {
            console.log('Respuesta de eliminación:', response);
            
            if (response.success || response.affected_rows > 0) {
              this.recibos = this.recibos.filter(r => r.id_recibo !== id);
              alert('Recibo eliminado correctamente');
            } else {
              alert('Error al eliminar recibo');
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

  getRecibosPorAlumno(idAlumno: number): Recibo[] {
    return this.recibos.filter(r => r.id_alumno === idAlumno);
  }

  exportarDatos(): void {
    const datosCSV = this.convertirACSV(this.recibos);
    this.descargarCSV(datosCSV, 'recibos.csv');
  }

  private convertirACSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  private descargarCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '-';
    
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  }
}