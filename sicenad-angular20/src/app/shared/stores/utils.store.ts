import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class UtilsStore {

  private http = inject(HttpClient);

  // --- STATE ---
  private _properties = signal<any | null>(null);
  properties = computed(() => this._properties());
  setProperties(value: any | null) {
    this._properties.set(value);
  }

  provincias = signal([
    { idProvincia: 15, nombre: 'A CORUÑA' },
    { idProvincia: 1, nombre: 'ALAVA' },
    { idProvincia: 2, nombre: 'ALBACETE' },
    { idProvincia: 3, nombre: 'ALICANTE' },
    { idProvincia: 4, nombre: 'ALMERIA' },
    { idProvincia: 33, nombre: 'ASTURIAS' },
    { idProvincia: 5, nombre: 'AVILA' },
    { idProvincia: 6, nombre: 'BADAJOZ' },
    { idProvincia: 8, nombre: 'BARCELONA' },
    { idProvincia: 9, nombre: 'BURGOS' },
    { idProvincia: 10, nombre: 'CACERES' },
    { idProvincia: 11, nombre: 'CADIZ' },
    { idProvincia: 39, nombre: 'CANTABRIA' },
    { idProvincia: 12, nombre: 'CASTELLON' },
    { idProvincia: 51, nombre: 'CEUTA' },
    { idProvincia: 13, nombre: 'CIUDAD REAL' },
    { idProvincia: 14, nombre: 'CORDOBA' },
    { idProvincia: 16, nombre: 'CUENCA' },
    { idProvincia: 17, nombre: 'GERONA' },
    { idProvincia: 18, nombre: 'GRANADA' },
    { idProvincia: 19, nombre: 'GUADALAJARA' },
    { idProvincia: 20, nombre: 'GUIPUZCOA' },
    { idProvincia: 21, nombre: 'HUELVA' },
    { idProvincia: 22, nombre: 'HUESCA' },
    { idProvincia: 7, nombre: 'ISLAS BALEARES' },
    { idProvincia: 23, nombre: 'JAEN' },
    { idProvincia: 26, nombre: 'LA RIOJA' },
    { idProvincia: 24, nombre: 'LEON' },
    { idProvincia: 25, nombre: 'LERIDA' },
    { idProvincia: 27, nombre: 'LUGO' },
    { idProvincia: 28, nombre: 'MADRID' },
    { idProvincia: 29, nombre: 'MALAGA' },
    { idProvincia: 52, nombre: 'MELILLA' },
    { idProvincia: 30, nombre: 'MURCIA' },
    { idProvincia: 31, nombre: 'NAVARRA' },
    { idProvincia: 32, nombre: 'OURENSE' },
    { idProvincia: 34, nombre: 'PALENCIA' },
    { idProvincia: 35, nombre: 'LAS PALMAS' },
    { idProvincia: 36, nombre: 'PONTEVEDRA' },
    { idProvincia: 37, nombre: 'SALAMANCA' },
    { idProvincia: 40, nombre: 'SEGOVIA' },
    { idProvincia: 41, nombre: 'SEVILLA' },
    { idProvincia: 42, nombre: 'SORIA' },
    { idProvincia: 38, nombre: 'STA CRUZ TENERIFE' },
    { idProvincia: 43, nombre: 'TARRAGONA' },
    { idProvincia: 44, nombre: 'TERUEL' },
    { idProvincia: 45, nombre: 'TOLEDO' },
    { idProvincia: 46, nombre: 'VALENCIA' },
    { idProvincia: 47, nombre: 'VALLADOLID' },
    { idProvincia: 48, nombre: 'VIZCAYA' },
    { idProvincia: 49, nombre: 'ZAMORA' },
    { idProvincia: 50, nombre: 'ZARAGOZA' },
  ]);

  // --- GETTERS ---
  urlApi = computed(() => this.properties()?.urlApi || '');
  passwordForRegister = computed(() => this.properties()?.passwordForRegister || '');
  minutosExpiracionLocalStorage = computed<number>(() => {
    const val = this.properties()?.minutosExpiracionLocalStorage;
    return val != null ? Number(val) : 0;
  });
  sizeMaxEscudo = computed<number>(() => {
    const val = this.properties()?.sizeMaxEscudo;
    return val != null ? Number(val) : 0;
  });
  sizeMaxDocRecurso = computed<number>(() => {
    const val = this.properties()?.sizeMaxDocRecurso;
    return val != null ? Number(val) : 0;
  });

  sizeMaxDocSolicitud = computed<number>(() => {
    const val = this.properties()?.sizeMaxDocSolicitud;
    return val != null ? Number(val) : 0;
  });

  sizeMaxCartografia = computed<number>(() => {
    const val = this.properties()?.sizeMaxCartografia;
    return val != null ? Number(val) : 0;
  });
  categoriaFicheroCartografia = computed(() => this.properties()?.categoriaFicheroCartografia || '1');
  tiposTiro = computed(() => this.properties()?.tiposTiro || []);
  escalasCartografia = computed(() => this.properties()?.escalasCartografia || []);
  estadosSolicitud = computed(() => this.properties()?.estadosSolicitud || []);
  coloresCalendario = computed(() => this.properties()?.coloresCalendario || {});

  // --- PARSE SEGURO ---
  parseJSON<T>(json: string | null, fallback: T): T {
    if (!json) return fallback;
    try {
      return JSON.parse(json) as T;
    } catch {
      return fallback;
    }
  }

  // --- ACTIONS ---
  cargarPropiedadesIniciales(): Observable<any> {
    if (this.properties()) return of(this.properties());
    return this.http.get(`${environment.publicPath}properties.json`).pipe(
      tap((res) => {
        this.setProperties(res);
        console.log('🔹 Properties cargadas:', res);
        console.log('urlapi1 ' + this.urlApi());
      }),
      catchError(err => {
        console.error('Error cargando properties.json:', err);
        return throwError(() => err);
      })
    );
  }
}
