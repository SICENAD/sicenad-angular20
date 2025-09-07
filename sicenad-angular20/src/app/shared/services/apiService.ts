import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, Injector } from "@angular/core";
import { AuthStore } from "@stores/auth.store";
import { catchError, map, Observable, throwError } from "rxjs";
import { UtilsStore } from "@stores/utils.store";
import { UtilService } from "./utilService";
import { LocalStorageService } from "./localStorageService";

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private utils = inject(UtilsStore);
  private injector = inject(Injector); // Injector general para inyección tardía
  private utilService = inject(UtilService);
  private localStorageService = inject(LocalStorageService);

  // Inyección tardía de AuthStore usando getter
  private get auth(): AuthStore {
    return this.injector.get(AuthStore);
  }

  getUrlApi(): string {
    const value = this.localStorageService.getItem<string>('urlApi');
    if (value && value.trim()) return value;

    // Fallback definitivo
    // return environment.apiUrl;
    // o si tienes utils:
    // return this.utils.urlApi();

    return '';
  }

  // --- REQUEST POST SIN TOKEN GENERAL (REGISTRO Y LOGIN) ---
  public postSinToken<T>(endpoint: string, body: any): Observable<T> {
    const urlBase = this.utils.urlApi();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    });
    return this.http.post<T>(`${urlBase}${endpoint}`, body, { headers }).pipe(
      catchError((err) => {
        console.error('Error en postSinToken:', err);
        throw err;
      })
    );
  }

  // --- REQUEST CON TOKEN GENERAL ---
  private requestConToken<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
    isFile: boolean = false
  ): Observable<T> {
    const urlBase = this.utils.urlApi();
    const token = this.auth.token();
    const headersObj: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (!isFile) {
      headersObj['Content-Type'] = 'application/json; charset=utf-8';
      headersObj['Accept'] = 'application/json';
    }

    const headers = new HttpHeaders(headersObj);

    let observable: Observable<T>;
    switch (method) {
      case 'POST':
        observable = this.http.post<T>(`${urlBase}${endpoint}`, body || {}, { headers });
        break;
      case 'PUT':
        observable = this.http.put<T>(`${urlBase}${endpoint}`, body || {}, { headers });
        break;
      case 'PATCH':
        observable = this.http.patch<T>(`${urlBase}${endpoint}`, body || {}, { headers });
        break;
      case 'DELETE':
        observable = this.http.delete<T>(`${urlBase}${endpoint}`, { headers });
        break;
      case 'GET':
      default:
        if (isFile) {
          // Indicamos que la respuesta será un blob
          observable = this.http.get(`${urlBase}${endpoint}`, { headers, responseType: 'blob' as 'json' }) as Observable<T>;
        } else {
          observable = this.http.get<T>(`${urlBase}${endpoint}`, { headers });
        }
    }

    return observable.pipe(
      catchError(async (err) => {
        if (err.status === 401 || err.status === 403) {
          this.utilService.toast('Sesión expirada. Por favor, inicia sesión de nuevo.', 'warning');
          await this.auth.logout();

        }
        throw err;
      })
    );
  }

  // --- Métodos públicos ---
  public peticionConToken<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any
  ): Observable<T> {
    return this.requestConToken<T>(url, method, body, false);
  }

  public peticionArchivoCarpetaConToken<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Observable<T> {
    return this.requestConToken<T>(url, method, body, true);
  }

  // ----------------- ARCHIVOS -----------------
  mostrarArchivo(url: string): Observable<Blob> {
    return this.peticionArchivoCarpetaConToken<Blob>(url, 'GET', null);
  }
  descargarArchivo(urlDownload: string, nombreArchivo: string): Observable<void> {
    return this.peticionArchivoCarpetaConToken<Blob>(urlDownload, 'GET', null).pipe(
      map((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        window.URL.revokeObjectURL(url);
        return void 0; // Esto emite "void"
      }),
      catchError(err => {
        alert('Error al descargar el archivo');
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  subirArchivo(urlUpload: string, archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.peticionArchivoCarpetaConToken<any>(urlUpload, 'POST', formData).pipe(
      map(res => res.nombreArchivo),
      catchError(err => {
        if (err.status === 413) alert('El archivo tiene un tamaño superior al permitido');
        return throwError(() => err);
      })
    );
  }

  private borrarRecurso(url: string, mensajeError: string): Observable<any> {
    return this.peticionArchivoCarpetaConToken<any>(url, 'GET').pipe(
      catchError(err => {
        if (err.status === 400) alert(mensajeError);
        return throwError(() => err);
      })
    );
  }

  borrarArchivo(urlUpload: string): Observable<any> {
    return this.borrarRecurso(urlUpload, 'El archivo no ha sido borrado');
  }

  borrarCarpeta(urlUpload: string): Observable<any> {
    return this.borrarRecurso(urlUpload, 'La carpeta no ha sido borrada');
  }
}
