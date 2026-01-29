import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL según tu estructura de backend
  // private apiUrl = 'http://localhost/backend/api';
  private apiUrl = 'http://localhost/Alejandro-proyecto-web/api/';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // ========== AUTH ==========
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login.php`, credentials, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // ========== ALUMNOS ==========
  getAlumnos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/alumnos.php`)
      .pipe(catchError(this.handleError));
  }

  getAlumno(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/alumnos.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createAlumno(alumno: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/alumnos.php`, alumno, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateAlumno(id: number, alumno: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/alumnos.php?id=${id}`, alumno, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteAlumno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/alumnos.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  // ========== PROFESORES ==========
  getProfesores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profesores.php`)
      .pipe(catchError(this.handleError));
  }

  getProfesor(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profesores.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createProfesor(profesor: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profesores.php`, profesor, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // updateProfesor(id: number, profesor: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/profesores.php?id=${id}`, profesor, this.httpOptions)
  //     .pipe(catchError(this.handleError));
  // }

  updateProfesor(id: number, data: any): Observable<any> {
  const url = `${this.apiUrl}profesores.php?id=${id}`;
  
  console.log('🔍 URL de actualización:', url);
  console.log('📦 Datos enviados:', data);
  
  return this.http.put(url, data, this.httpOptions).pipe(
    tap(response => {
      console.log('✅ Respuesta del servidor:', response);
    }),
    catchError(error => {
      console.error('❌ Error completo:', error);
      
      // Intentar obtener más información del error
      let errorMessage = 'Error desconocido';
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        errorMessage = `Error ${error.status}: ${error.statusText}`;
        
        // Si el error contiene HTML, extraer información útil
        if (typeof error.error === 'string' && error.error.includes('<br />')) {
          console.error('❌ El servidor devolvió HTML en lugar de JSON');
          console.error('❌ Contenido del error:', error.error.substring(0, 500));
          errorMessage += ' - El servidor devolvió un error HTML. Revisa la consola del servidor.';
        } else if (error.error && error.error.message) {
          errorMessage += ` - ${error.error.message}`;
        }
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
}


  deleteProfesor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profesores.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  // ========== AULAS ==========
  getAulas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/aulas.php`)
      .pipe(catchError(this.handleError));
  }

  getAula(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/aulas.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createAula(aula: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/aulas.php`, aula, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateAula(id: number, aula: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/aulas.php?id=${id}`, aula, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteAula(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/aulas.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  // ========== HORARIOS ==========
  getHorarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/horarios.php`)
      .pipe(catchError(this.handleError));
  }

  getHorario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/horarios.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createHorario(horario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/horarios.php`, horario, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateHorario(id: number, horario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/horarios.php?id=${id}`, horario, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/horarios.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  // ========== RECIBOS ==========
  getRecibos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recibos.php`)
      .pipe(catchError(this.handleError));
  }

  getRecibo(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recibos.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createRecibo(recibo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/recibos.php`, recibo, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateRecibo(id: number, recibo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/recibos.php?id=${id}`, recibo, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteRecibo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recibos.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  // ========== MANEJO DE ERRORES ==========
  private handleError(error: HttpErrorResponse) {
    console.error('API Service Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });

    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifica que:';
          errorMessage += '\n1. XAMPP esté iniciado';
          errorMessage += '\n2. Apache esté corriendo';
          errorMessage += '\n3. El backend esté en: http://localhost/backend/api/';
          break;

        case 400:
          errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
          break;

        case 401:
          errorMessage = 'No autorizado. Credenciales incorrectas.';
          break;

        case 403:
          errorMessage = 'Acceso prohibido. No tienes permisos.';
          break;

        case 404:
          errorMessage = 'Recurso no encontrado. Verifica la URL.';
          break;

        case 405:
          errorMessage = 'Método no permitido.';
          break;

        case 500:
          errorMessage = 'Error interno del servidor. Contacta al administrador.';
          break;

        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
          if (error.error && error.error.message) {
            errorMessage += ` - ${error.error.message}`;
          }
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // ========== MÉTODOS ADICIONALES ÚTILES ==========

  // Para subir archivos (si necesitas)
  uploadFile(endpoint: string, file: File, data?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    return this.http.post(`${this.apiUrl}/${endpoint}`, formData)
      .pipe(catchError(this.handleError));
  }

  // Método genérico para GET con parámetros
  getWithParams(endpoint: string, params?: any): Observable<any> {
    let url = `${this.apiUrl}/${endpoint}`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.http.get(url)
      .pipe(catchError(this.handleError));
  }
}