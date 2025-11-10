import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class UtilsStore {
  private http = inject(HttpClient);

  constructor() {
    // Cada vez que cambien los colores, actualizamos las variables CSS
    effect(() => {
      const colores = this.coloresDisponibles();
      const root = document.documentElement;
      Object.entries(colores).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value as string);
      });
    });
  }

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
  urlSitio = computed(() => this.properties()?.urlSitio || '');
  webServerRelativeUrl = computed(() => this.properties()?.webServerRelativeUrl || '');
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
  idiomasDisponibles = computed(() => this.properties()?.idiomasDisponibles || []);
  coloresDisponibles = computed(() => this.properties()?.coloresDisponibles || {});

  // Recomendación de credenciales para peticiones fetch/xhr
  // Devuelve 'same-origin' si urlApi resuelve al mismo origin que la app, o 'include' si es cross-origin
  credentialsRecommendation = computed<string>(() => {
    const props = this.properties();
    const raw = props?.urlApi;
    if (!raw) return 'same-origin';
    try {
      // Resolvemos urlApi relativo respecto al origen actual
      const resolved = new URL(raw, window.location.origin);
      return resolved.origin === window.location.origin ? 'same-origin' : 'include';
    } catch {
      return 'same-origin';
    }
  });

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
  /**
  * Carga las propiedades iniciales desde properties.txt
  * (usamos .txt en lugar de .json por limitaciones de SharePoint)
  */
  cargarPropiedadesIniciales(): Observable<any> {
    if (this.properties()) return of(this.properties());
  const filePath = `${environment.publicPath}properties.txt`;
  console.log(`Cargando properties desde: ${filePath}`);
  // En producción puede requerirse la cookie de autenticación de SharePoint
  // enviamos withCredentials para que el navegador adjunte cookies del sitio
  return this.http.get(filePath, { responseType: 'text' as 'text', withCredentials: this.credentialsRecommendation() === 'include' }).pipe(
      map((text) => {
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('❌ Error parseando properties.txt: ' + e);
        }
      }),
      tap((res) => {
        // No alteramos la URL que el administrador haya puesto en properties.txt.
        // Dejarla tal cual evita sorpresas al desplegar en distintos entornos.
        // Registramos para diagnóstico y resolvemos la URL contra window.location.origin
        let resolvedHref = '';
        let recommendation = 'same-origin';
        try {
          if (res && res.urlApi) {
            console.log('Properties.urlApi (original):', res.urlApi);
            const resolved = new URL(res.urlApi, window.location.origin);
            resolvedHref = resolved.href;
            recommendation = resolved.origin === window.location.origin ? 'same-origin' : 'include';
          }
        } catch (e) {
          // ignore en entornos no-browser o formatos raros
        }
        this.setProperties(res);
        console.log('🔹 Properties cargadas:', res);
        console.log('urlApi (resuelta):', resolvedHref || res.urlApi);
        console.log('Recomendación credentials:', recommendation, "(use 'same-origin' si la app y la API comparten origen, o 'include' si son distintos)");
      }),
      catchError((err) => {
        console.error('Error cargando properties.txt:', err);
        return throwError(() => err);
      })
    );
  }
}
