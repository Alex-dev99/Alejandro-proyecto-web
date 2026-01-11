import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/academia-api/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

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

  updateProfesor(id: number, profesor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profesores.php?id=${id}`, profesor, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteProfesor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profesores.php?id=${id}`)
      .pipe(catchError(this.handleError));
  }

getAulas(): Observable<any> {
  return this.http.get(`${this.apiUrl}/aulas.php`)
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

getRecibos(): Observable<any> {
  return this.http.get(`${this.apiUrl}/recibos.php`)
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

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login.php`, credentials, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en la API:', error);
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}