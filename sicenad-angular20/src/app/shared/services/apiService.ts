import { HttpClient } from "@angular/common/http";
import { inject, Injectable, Injector } from "@angular/core";
import { AuthStore } from "@stores/auth.store";
import { catchError, map, Observable, throwError } from "rxjs";
import { UtilsStore } from "@stores/utils.store";
import { UtilService } from "./utilService";
import { LocalStorageService } from "./localStorageService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private utils = inject(UtilsStore);
  private injector = inject(Injector); // Injector general para inyección tardía
  private utilService = inject(UtilService);
  private localStorageService = inject(LocalStorageService);
  private idiomaService = inject(IdiomaService);

  // Inyección tardía de AuthStore usando getter
  private get auth(): AuthStore {
    return this.injector.get(AuthStore);
  }

  getUrlApi(): string {
    const value = this.localStorageService.getItem<string>('urlApi');
    if (value && value.trim()) return value;
    return '';
  }

  // --- REQUEST GENERAL ---
  request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
  ): Observable<T> {
    let observable: Observable<T>;
    switch (method) {
      case 'POST':
        observable = this.http.post<T>(`${this.utils.urlApi()}${endpoint}`, body || {});
        break;
      case 'PUT':
        observable = this.http.put<T>(`${this.utils.urlApi()}${endpoint}`, body || {});
        break;
      case 'PATCH':
        observable = this.http.patch<T>(`${this.utils.urlApi()}${endpoint}`, body || {});
        break;
      case 'DELETE':
        observable = this.http.delete<T>(`${this.utils.urlApi()}${endpoint}`);
        break;
      case 'GET':
      default:
          observable = this.http.get<T>(`${this.utils.urlApi()}${endpoint}`);
    }
    return observable.pipe(
      catchError(async (err) => {
        if (err.status === 401 || err.status === 403) {
          this.utilService.toast(err.message, 'warning');
          //this.utilService.toast(this.idiomaService.t('sesionExpirada'), 'warning');
          //await this.auth.logout();
        }
        throw err;
      })
    );
  }

  // ----------------- ARCHIVOS -----------------
  mostrarArchivo(url: string): Observable<Blob> {
    return this.request<Blob>(url, 'GET', null);
  }
  descargarArchivo(urlDownload: string, nombreArchivo: string): Observable<void> {
    return this.request<Blob>(urlDownload, 'GET', null).pipe(
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
        alert(this.idiomaService.t('errorDescarga'));
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  subirArchivo(urlUpload: string, archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.request<any>(urlUpload, 'POST', formData).pipe(
      map(res => res.nombreArchivo),
      catchError(err => {
        if (err.status === 413) alert(this.idiomaService.t('errorTamanoArchivo'));
        return throwError(() => err);
      })
    );
  }

  private borrarRecurso(url: string, mensajeError: string): Observable<any> {
    return this.request<any>(url, 'GET').pipe(
      catchError(err => {
        if (err.status === 400) alert(mensajeError);
        return throwError(() => err);
      })
    );
  }

  borrarArchivo(urlUpload: string): Observable<any> {
    return this.borrarRecurso(urlUpload, this.idiomaService.t('errorBorrarArchivo'));
  }

  borrarCarpeta(urlUpload: string): Observable<any> {
    return this.borrarRecurso(urlUpload, this.idiomaService.t('errorBorrarCarpeta'));
  }
}
