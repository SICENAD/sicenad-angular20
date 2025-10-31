import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, Injector } from "@angular/core";
import { AuthStore } from "@stores/auth.store";
import { catchError, map, Observable, throwError, firstValueFrom, switchMap, from, of, concatMap, toArray, forkJoin } from "rxjs";
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

  /**
 * Obtiene el FormDigestValue necesario para operaciones POST/MERGE/DELETE en SharePoint
 */
  async getRequestDigest(): Promise<string> {
    // Si existe en el DOM, lo usa directamente (más rápido)
    const el = document.getElementById('__REQUESTDIGEST') as HTMLInputElement | null;
    if (el?.value) return el.value;
    const url = `${this.utils.urlSitio()}/_api/contextinfo`;
    const headers = new HttpHeaders({ 'Accept': 'application/json;odata=verbose' });
    const res: any = await firstValueFrom(
      this.http.post(url, {}, { headers, withCredentials: true })
    );
    return res?.d?.GetContextWebInformation?.FormDigestValue ?? '';
  }

  /**
   * Devuelve el EntityTypeFullName de una lista
   */
  async obtenerEntityType(nombreLista: string): Promise<string> {
    const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')?$select=ListItemEntityTypeFullName`;
    const headers = new HttpHeaders({ 'Accept': 'application/json;odata=verbose' });
    const tipoData: any = await firstValueFrom(
      this.http.get(url, { headers, withCredentials: true })
    );
    return tipoData?.d?.ListItemEntityTypeFullName ?? '';
  }

  /**
   * Obtiene elementos de una lista (con url completa o personalizada)
   */
  async getListaElementos(url: string): Promise<any[]> {
    const headers = new HttpHeaders({ 'Accept': 'application/json;odata=verbose' });
    const json: any = await firstValueFrom(
      this.http.get(url, { headers, withCredentials: true })
    );
    return json?.d?.results ?? [];
  }

  /**
   * Crea un elemento en una lista de SharePoint
   */
  async crearElemento(nombreLista: string, elemento: any): Promise<any> {
    const entityType = await this.obtenerEntityType(nombreLista);
    const digest = await this.getRequestDigest();
    const body = {
      __metadata: { type: entityType },
      ...elemento
    };
    const headers = new HttpHeaders({
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'X-RequestDigest': digest
    });
    const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items`;
    const res: any = await firstValueFrom(
      this.http.post(url, body, { headers, withCredentials: true })
    );
    return res?.d;
  }

  /**
   * Edita un elemento existente
   */
  async editarElemento(id: number, nombreLista: string, elemento: any): Promise<boolean> {
    const entityType = await this.obtenerEntityType(nombreLista);
    const digest = await this.getRequestDigest();
    const body = {
      __metadata: { type: entityType },
      ...elemento
    };
    const headers = new HttpHeaders({
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'IF-MATCH': '*'
    });
    const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`;
    try {
      await firstValueFrom(this.http.post(url, body, { headers, withCredentials: true }));
      return true;
    } catch (error) {
      console.error('Error al editar elemento:', error);
      return false;
    }
  }

  /**
   * Elimina un elemento por ID
   */
  async eliminarElemento(id: number, nombreLista: string): Promise<boolean> {
    const digest = await this.getRequestDigest();
    const headers = new HttpHeaders({
      'Accept': 'application/json;odata=verbose',
      'X-HTTP-Method': 'DELETE',
      'IF-MATCH': '*',
      'X-RequestDigest': digest
    });
    const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`;
    try {
      await firstValueFrom(this.http.post(url, {}, { headers, withCredentials: true }));
      return true;
    } catch (error: any) {
      console.error('Error al eliminar elemento:', error);
      return false;
    }
  }

// ------------------ ARCHIVOS (SharePoint Foundation 2019) ------------------

/**
 * 📤 Sube un archivo a una biblioteca (Foundation compatible)
 */
async subirArchivo(libraryName: string, folderPath: string, file: File, overwrite = true) {
  try {
    const digest = await this.getRequestDigest();

    const baseFolder = folderPath
      ? `${libraryName}/${folderPath}`.replace(/\/+$/, '')
      : libraryName;

    // Crear carpetas si no existen
    await this.crearCarpetasSiNoExisten(libraryName, folderPath, digest);

    const uploadUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${baseFolder}')/Files/add(url='${file.name}',overwrite=${overwrite})`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'X-RequestDigest': digest
      },
      body: file,
      credentials: 'same-origin'
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error al subir archivo: ${errText}`);
    }

    const json = await res.json();
    console.log(`✅ Archivo "${file.name}" subido a ${baseFolder}`);
    return json.d;
  } catch (error) {
    console.error('❌ Error en subirArchivo:', error);
    throw error;
  }
}

/**
 * 🗂️ Crea carpetas intermedias si no existen
 */
async crearCarpetasSiNoExisten(libraryName: string, folderPath: string, digest: string) {
  if (!folderPath) return;

  const parts = folderPath.split('/').filter(p => p.trim().length > 0);
  let currentPath = libraryName;

  for (const part of parts) {
    const folderUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${currentPath}')/folders/add('${part}')`;

    const res = await fetch(folderUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'X-RequestDigest': digest
      },
      credentials: 'same-origin'
    });

    // Si ya existe (409 Conflict), continuar
    if (!res.ok && res.status !== 409) {
      const errText = await res.text();
      console.warn(`⚠️ Error al crear carpeta '${part}': ${errText}`);
    }

    currentPath += `/${part}`;
  }
}

/**
 * 📥 Descarga un archivo de la biblioteca
 * @param libraryName Ej: 'Documentos'
 * @param relativePath Ej: 'Proyectos/2025/informe.pdf'
 */
async descargarArchivo(libraryName: string, relativePath: string, nombreDescarga?: string) {
  try {
    const fileUrl = `${this.utils.urlSitio()}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(this.utils.urlSitio() + '/' + libraryName + '/' + relativePath)}`;

    const res = await fetch(fileUrl, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Error al descargar archivo');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreDescarga || relativePath.split('/').pop()!;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log(`📥 Archivo descargado: ${nombreDescarga || relativePath}`);
  } catch (error) {
    console.error('❌ Error al descargar archivo:', error);
    throw error;
  }
}

/**
 * 🗑️ Elimina un archivo de la biblioteca
 */
async eliminarArchivo(libraryName: string, relativePath: string) {
  try {
    const digest = await this.getRequestDigest();
    const deleteUrl = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${libraryName}/${relativePath}')`;

    const res = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'X-HTTP-Method': 'DELETE',
        'IF-MATCH': '*',
        'X-RequestDigest': digest
      },
      credentials: 'same-origin'
    });

    if (res.ok) {
      console.log(`🗑️ Archivo eliminado: ${relativePath}`);
      return true;
    } else {
      const errText = await res.text();
      throw new Error(`Error al eliminar archivo: ${errText}`);
    }
  } catch (error) {
    console.error('❌ Error en eliminarArchivo:', error);
    throw error;
  }
}

// Borra una carpeta y todo su contenido recursivamente
borrarCarpetaRecursiva(nombreBiblioteca: string, rutaCarpeta: string): Observable<boolean> {
  return from(this.getRequestDigest()).pipe(
    switchMap((digest) => this._borrarCarpetaRecursivaInterna(nombreBiblioteca, rutaCarpeta, digest)),
    catchError((error) => {
      console.error('Error al borrar carpeta recursiva:', error);
      return of(false);
    })
  );
}

// ---- método interno (recursivo) ----
private _borrarCarpetaRecursivaInterna(nombreBiblioteca: string, rutaCarpeta: string, digest: string): Observable<boolean> {
  const carpetaUrl = `${this.utils.urlSitio()}/${nombreBiblioteca}/${rutaCarpeta}`;

  // 1️⃣ Obtener contenido de la carpeta
  const contenidoUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')/Folders?$select=Name,ServerRelativeUrl&$expand=Folders,Files`;

  return from(fetch(contenidoUrl, {
    headers: { "Accept": "application/json;odata=verbose" },
    credentials: "same-origin"
  })).pipe(
    switchMap(async (res) => {
      if (!res.ok) throw new Error(`Error al obtener contenido: ${await res.text()}`);
      const json = await res.json();
      return json.d.results || [];
    }),
    switchMap((subcarpetas) => {
      // 2️⃣ Obtener archivos de la carpeta actual
      const archivosUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')/Files`;
      return from(fetch(archivosUrl, {
        headers: { "Accept": "application/json;odata=verbose" },
        credentials: "same-origin"
      })).pipe(
        switchMap(async (res) => {
          const json = await res.json();
          return { subcarpetas, archivos: json.d.results || [] };
        })
      );
    }),
    switchMap(({ subcarpetas, archivos }) => {
      // 3️⃣ Eliminar archivos de la carpeta actual
      const borrarArchivos$ = from(archivos).pipe(
        concatMap((file: any) => from(fetch(
          `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${file.ServerRelativeUrl}')`,
          {
            method: "POST",
            headers: {
              "X-HTTP-Method": "DELETE",
              "IF-MATCH": "*",
              "X-RequestDigest": digest
            },
            credentials: "same-origin"
          }
        ))),
        toArray() // esperar a que terminen todos
      );

      // 4️⃣ Eliminar subcarpetas recursivamente
      const borrarSubcarpetas$ = from(subcarpetas).pipe(
        concatMap((sub: any) => {
          const subRuta = sub.ServerRelativeUrl.replace(`${this.utils.urlSitio()}/${nombreBiblioteca}/`, '');
          return this._borrarCarpetaRecursivaInterna(nombreBiblioteca, subRuta, digest);
        }),
        toArray()
      );

      return forkJoin([borrarArchivos$, borrarSubcarpetas$]).pipe(
        switchMap(() => {
          // 5️⃣ Finalmente borrar la carpeta actual
          const deleteUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')`;
          return from(fetch(deleteUrl, {
            method: "POST",
            headers: {
              "X-HTTP-Method": "DELETE",
              "IF-MATCH": "*",
              "X-RequestDigest": digest
            },
            credentials: "same-origin"
          })).pipe(
            map(res => res.ok)
          );
        })
      );
    })
  );
}




  /*
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
*/
}
