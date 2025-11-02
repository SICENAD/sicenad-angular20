import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, Injector } from "@angular/core";
import { AuthStore } from "@stores/auth.store";
import { catchError, map, Observable, throwError, switchMap, from, of, concatMap, toArray, forkJoin, tap } from "rxjs";
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

  // --- REQUEST GENERAL  PARA NO CAMBIAR LOS SERVICIOS INDIVIDUALES---
  request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
  ): Observable<T> {
    let observable: Observable<T>;
    switch (method) {
      case 'POST':
        observable = from(this.crearElemento(endpoint, body)) as Observable<T>;
        break;
      case 'PUT':
        if (!body?.Id) {
          return throwError(() => new Error('No se indicó ID para PUT'));
        }
        observable = from(this.editarElemento(body.Id, endpoint, body)).pipe(
          map(result => result as unknown as T)
        );
        break;
      case 'PATCH':
        console.log(body?.Id);
        if (!body?.Id) {
          return throwError(() => new Error('No se indicó ID para PATCH'));
        }
        observable = from(this.editarElemento(body.Id, endpoint, body)).pipe(
          map(result => result as unknown as T)
        );
        break;
      case 'DELETE':
        if (!body?.Id) {
          return throwError(() => new Error('No se indicó ID para DELETE'));
        }
        observable = from(this.eliminarElemento(body.Id, endpoint)).pipe(
          map(result => result as unknown as T)
        );
        break;
      case 'GET':
      default:
        observable = from(this.getListaElementos(endpoint)) as Observable<T>;
    }
    return observable.pipe(
      catchError(async (err) => {
        if (err.status === 401 || err.status === 403) {
          this.utilService.toast(err.message, 'warning');
        }
        throw err;
      })
    );
  }

  // ----------------- ARCHIVOS -----------------
  mostrarArchivo(url: string): Observable<Blob> {
    // url = '/Biblioteca/Carpeta/archivo.ext'
    const parts = url.replace(/^\/+/, '').split('/');
    const libraryName = parts.shift()!; // primera parte = biblioteca
    const relativePath = parts.join('/'); // resto = ruta relativa + archivo
    return this.mostrarArchivoSharePoint(libraryName, relativePath).pipe(
      catchError(err => {
        console.error('Error al mostrar archivo:', err);
        return throwError(() => err);
      })
    );
  }

  descargarArchivo(urlDownload: string, nombreArchivo: string): Observable<void> {
    // urlDownload: '/Biblioteca/Carpeta1/Carpeta2/archivo.ext'
    const parts = urlDownload.replace(/^\/+/, '').split('/');
    const libraryName = parts.shift()!; // primera parte = biblioteca
    const relativePath = parts.join('/'); // resto incluye subcarpetas y el archivo
    return from(this.descargarArchivoSharePoint(libraryName, relativePath));
  }

  subirArchivo(urlUpload: string, archivo: File): Observable<string> {
    return this.subirArchivoSharePoint(urlUpload, archivo);
  }

  borrarArchivo(urlUpload: string): Observable<any> {
    // urlUpload: '/Biblioteca/Carpeta1/Carpeta2/archivo.ext'
    const parts = urlUpload.replace(/^\/+/, '').split('/');
    const libraryName = parts.shift()!; // primera parte = biblioteca
    const relativePath = parts.join('/'); // resto incluye subcarpetas y archivo

    return this.borrarArchivoSharePoint(libraryName, relativePath);
  }

  borrarCarpeta(url: string): Observable<any> {
    // url: '/Biblioteca/Carpeta1/Carpeta2'
    const parts = url.replace(/^\/+/, '').split('/');
    const libraryName = parts.shift()!; // primera parte = biblioteca
    const relativePath = parts.join('/'); // resto = ruta de la carpeta
    return this.borrarCarpetaRecursiva(libraryName, relativePath);
  }

  /**
   * Obtiene el FormDigestValue necesario para operaciones POST/MERGE/DELETE en SharePoint
   */
  private getRequestDigest(): Observable<string> {
    const el = document.getElementById('__REQUESTDIGEST') as HTMLInputElement;
    if (el?.value) return of(el.value);
    const url = `${this.utils.urlSitio()}/_api/contextinfo`;
    const headers = new HttpHeaders({ 'Accept': 'application/json;odata=verbose' });
    return this.http.post<any>(url, {}, { headers, withCredentials: true }).pipe(
      map((res: any) => res?.d?.GetContextWebInformation?.FormDigestValue),
      catchError(err => {
        console.error('Error al obtener digest', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Devuelve el EntityTypeFullName de una lista
   */
  private obtenerEntityType(nombreLista: string): Observable<string> {
    const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')?$select=ListItemEntityTypeFullName`;
    const headers = new HttpHeaders({ 'Accept': 'application/json;odata=verbose' });
    return this.http.get<any>(url, { headers, withCredentials: true }).pipe(
      map(res => res?.d?.ListItemEntityTypeFullName ?? ''),
      catchError(err => {
        console.error('Error al obtener EntityTypeFullName:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene elementos de una lista (con url completa o personalizada)
   */
  getListaElementos(url: string): Observable<any[]> {
    const headers = new HttpHeaders({ 'Accept': 'application/json;odata=verbose' });
    return this.http.get<any>(url, { headers, withCredentials: true }).pipe(
      map(res => res?.d?.results ?? []),
      catchError(err => {
        console.error('Error al obtener lista de elementos', err);
        return throwError(() => err);
      })
    );
  }

/**
 * 🔍 Obtiene elementos de una lista de SharePoint con filtro y selección de campos opcional.
 */
getListaElementosFiltrados(
  nombreLista: string,
  filtro: string,
  camposSelect: string[] = []
): Observable<any> {
  // 🔧 Construcción dinámica de parámetros
  const selectParam = camposSelect.length ? `$select=${camposSelect.join(',')}` : '';
  const filterParam = filtro ? `$filter=${filtro}` : '';
  // 🔗 Unir parámetros (con & solo si ambos existen)
  const query = [filterParam, selectParam].filter(p => p).join('&');
  const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items${query ? '?' + query : ''}`;
  const headers = new HttpHeaders({
    'Accept': 'application/json;odata=verbose'
  });
  return this.http.get<any>(url, { headers, withCredentials: true }).pipe(
    catchError(err => {
      console.error(`❌ Error en getListaElementosFiltrados('${nombreLista}')`, err);
      return throwError(() => err);
    })
  );
}

  /**
   * Crea un elemento en una lista de SharePoint
   */
  crearElemento(nombreLista: string, elemento: any): Observable<any> {
    return this.obtenerEntityType(nombreLista).pipe(
      switchMap(entityType =>
        this.getRequestDigest().pipe(
          switchMap(digest => {
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
            return this.http.post<any>(url, body, { headers, withCredentials: true }).pipe(
              map(res => res?.d),
              catchError(err => {
                console.error('Error al crear elemento:', err);
                return throwError(() => err);
              })
            );
          })
        )
      )
    );
  }

  /**
   * Edita un elemento existente
   */
  editarElemento(id: number, nombreLista: string, elemento: any): Observable<boolean> {
    return this.obtenerEntityType(nombreLista).pipe(
      switchMap(entityType =>
        this.getRequestDigest().pipe(
          switchMap(digest => {
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
           return this.http.post<any>(url, body, { headers, withCredentials: true }).pipe(
            switchMap(() =>
              // Después del MERGE, pedimos el elemento actualizado
              this.http.get<any>(
                `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`,
                { headers: new HttpHeaders({ 'Accept': 'application/json;odata=verbose' }), withCredentials: true }
              )
            ),
            map(res => res.d),
            catchError(err => {
              console.error('❌ Error al editar elemento:', err);
              return throwError(() => err);
            })
          );
          })
        )
      )
    );
  }

  /**
   * Elimina un elemento por ID
   */
  eliminarElemento(id: number, nombreLista: string): Observable<boolean> {
    return this.getRequestDigest().pipe(
      switchMap(digest => {
        const headers = new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*',
          'X-RequestDigest': digest
        });
        const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`;
        return this.http.post<any>(url, {}, { headers, withCredentials: true }).pipe(
          map(() => true),
          catchError(err => {
            console.error('Error al eliminar elemento:', err);
            return of(false);
          })
        );
      })
    );
  }

  // ------------------ ARCHIVOS (SharePoint Foundation 2019) ------------------
  // ------------------ ARCHIVOS (SharePoint Foundation 2019) ------------------

  /**
   * 📤 Sube un archivo a SharePoint (compatible con tu API antigua)
   * @param urlUpload Ruta relativa dentro del sitio (puede incluir biblioteca + subcarpetas)
   * @param archivo Archivo a subir
   */
  subirArchivoSharePoint(urlUpload: string, archivo: File, overwrite = true): Observable<string> {
    return this.getRequestDigest().pipe(
      switchMap(digest => {
        // Separar biblioteca y posibles subcarpetas
        const parts = urlUpload.split('/').filter(p => p.trim().length > 0);
        const libraryName = parts.shift()!; // primera parte es la biblioteca
        const folderPath = parts.join('/'); // resto es la ruta dentro de la biblioteca
        // Crear carpetas si no existen
        return this.crearCarpetasSiNoExisten(libraryName, folderPath, digest).pipe(
          switchMap(() => {
            const baseFolder = folderPath ? `${libraryName}/${folderPath}` : libraryName;
            const url = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${baseFolder}')/Files/add(url='${archivo.name}',overwrite=${overwrite})`;
            const headers = new HttpHeaders({
              'Accept': 'application/json;odata=verbose',
              'X-RequestDigest': digest
            });
            return this.http.post<any>(url, archivo, { headers, withCredentials: true }).pipe(
              map(res => res.d.Name), // devolver el nombre del archivo como antes
              tap(() => console.log(`✅ Archivo "${archivo.name}" subido a ${baseFolder}`)),
              catchError(err => {
                if (err.status === 413) alert(this.idiomaService.t('errorTamanoArchivo'));
                console.error('❌ Error en subirArchivo:', err);
                return throwError(() => err);
              })
            );
          })
        );
      })
    );
  }

  /**
   * 🗂️ Crea carpetas intermedias si no existen (Observable)
   */
  crearCarpetasSiNoExisten(libraryName: string, folderPath: string, digest: string): Observable<void> {
    if (!folderPath) return of(void 0);

    const parts = folderPath.split('/').filter(p => p.trim().length > 0);
    let currentPath = libraryName;

    return from(parts).pipe(
      concatMap(part => {
        const folderUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${currentPath}')/folders/add('${part}')`;
        const headers = new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'X-RequestDigest': digest
        });
        return this.http.post<any>(folderUrl, {}, { headers, withCredentials: true }).pipe(
          catchError(err => {
            if (err.status === 409) return of(void 0); // carpeta ya existe
            console.warn(`⚠️ Error al crear carpeta '${part}':`, err);
            return throwError(() => err);
          }),
          tap(() => { currentPath += `/${part}`; })
        );
      }),
      toArray(),
      map(() => void 0)
    );
  }

  /**
   * 📥 Descarga un archivo de la biblioteca (Observable)
   * relativePath es la ruta de carpetas y el archivo dentro de la biblioteca
   */
  descargarArchivoSharePoint(libraryName: string, relativePath: string): Observable<void> {
    const fileUrl = `${this.utils.urlSitio()}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(
      `${this.utils.urlSitio()}/${libraryName}/${relativePath}`
    )}`;
    return this.http.get(fileUrl, { responseType: 'blob', withCredentials: true }).pipe(
      map(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = relativePath.split('/').pop()!;
        a.click();
        window.URL.revokeObjectURL(url);
      }),
      map(() => void 0),
      catchError(err => {
        alert(this.idiomaService.t('errorDescarga'));
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  /**
 * 📥 Muestra un archivo de la biblioteca (Observable)
 * relativePath es la ruta de carpetas y el archivo dentro de la biblioteca
 */
  mostrarArchivoSharePoint(libraryName: string, relativePath: string): Observable<Blob> {
    const url = `${this.utils.urlSitio()}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(this.utils.urlSitio() + '/' + libraryName + '/' + relativePath)}`;
    return this.http.get(url, { responseType: 'blob', withCredentials: true }).pipe(
      catchError(err => {
        console.error('Error al mostrar archivo SharePoint:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * 🗑️ Elimina un archivo de la biblioteca (Observable)
   */
  borrarArchivoSharePoint(libraryName: string, relativePath: string): Observable<boolean> {
    return this.getRequestDigest().pipe(
      switchMap(digest => {
        const url = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${libraryName}/${relativePath}')`;
        const headers = new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*',
          'X-RequestDigest': digest
        });
        return this.http.post<any>(url, {}, { headers, withCredentials: true }).pipe(
          map(() => {
            console.log(`🗑️ Archivo eliminado: ${relativePath}`);
            return true;
          }),
          catchError(err => {
            console.error('❌ Error en eliminarArchivo:', err);
            return of(false);
          })
        );
      })
    );
  }

  /**
   * 🗑️ Borra una carpeta y todo su contenido recursivamente (Observable)
   */
  borrarCarpetaRecursiva(nombreBiblioteca: string, rutaCarpeta: string): Observable<boolean> {
    return this.getRequestDigest().pipe(
      switchMap(digest => this._borrarCarpetaRecursivaInterna(nombreBiblioteca, rutaCarpeta, digest)),
      catchError(err => {
        console.error('Error al borrar carpeta recursiva:', err);
        return of(false);
      })
    );
  }

  /**
   * Método interno recursivo para borrar carpeta
   */
  private _borrarCarpetaRecursivaInterna(nombreBiblioteca: string, rutaCarpeta: string, digest: string): Observable<boolean> {
    const carpetaUrl = `${this.utils.urlSitio()}/${nombreBiblioteca}/${rutaCarpeta}`;
    const getFoldersUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')/Folders`;
    const getFilesUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')/Files`;
    // 1️⃣ Obtener subcarpetas y archivos
    const folders$ = this.http.get<any>(getFoldersUrl, { headers: new HttpHeaders({ 'Accept': 'application/json;odata=verbose' }), withCredentials: true }).pipe(
      map(res => res?.d?.results ?? []),
      catchError(() => of([]))
    );
    const files$ = this.http.get<any>(getFilesUrl, { headers: new HttpHeaders({ 'Accept': 'application/json;odata=verbose' }), withCredentials: true }).pipe(
      map(res => res?.d?.results ?? []),
      catchError(() => of([]))
    );
    return forkJoin([folders$, files$]).pipe(
      switchMap(([subcarpetas, archivos]) => {
        // 2️⃣ Borrar archivos
        const borrarArchivos$ = from(archivos).pipe(
          concatMap((file: any) => this.borrarArchivoSharePoint(nombreBiblioteca, file.ServerRelativeUrl.replace(`${this.utils.urlSitio()}/`, ''))),
          toArray()
        );
        // 3️⃣ Borrar subcarpetas recursivamente
        const borrarSubcarpetas$ = from(subcarpetas).pipe(
          concatMap((sub: any) => {
            const subRuta = sub.ServerRelativeUrl.replace(`${this.utils.urlSitio()}/${nombreBiblioteca}/`, '');
            return this._borrarCarpetaRecursivaInterna(nombreBiblioteca, subRuta, digest);
          }),
          toArray()
        );
        // 4️⃣ Finalmente borrar carpeta actual
        return forkJoin([borrarArchivos$, borrarSubcarpetas$]).pipe(
          switchMap(() => {
            const url = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')`;
            const headers = new HttpHeaders({
              'X-HTTP-Method': 'DELETE',
              'IF-MATCH': '*',
              'X-RequestDigest': digest
            });
            return this.http.post<any>(url, {}, { headers, withCredentials: true }).pipe(
              map(() => true),
              catchError(() => of(false))
            );
          })
        );
      })
    );
  }

  /**
   * 📚 Crea una biblioteca de documentos con el nombre de la entidad (cenad.nombre)
   */
  crearBibliotecaCenad(nombre: string): Observable<any> {
    const url = this.utils.urlApi();
    return this.getRequestDigest().pipe(
      switchMap(digest => {
        const headers = new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest
        });
        const body = {
          __metadata: { type: 'SP.List' },
          AllowContentTypes: true,
          BaseTemplate: 101, // Document Library
          ContentTypesEnabled: true,
          Title: nombre
        };
        return this.http.post(url, body, { headers, withCredentials: true }).pipe(
          tap(() => console.log(`✅ Biblioteca de documentos creada: ${nombre}`)),
          catchError(err => {
            if (err.status === 409) {
              console.warn(`⚠️ Biblioteca "${nombre}" ya existe`);
              return of(null);
            }
            console.error('❌ Error al crear biblioteca:', err);
            return throwError(() => err);
          })
        );
      })
    );
  }

  /**
   * 🗑️ Elimina una biblioteca de documentos completa (por nombre)
   * @param nombreBiblioteca Nombre exacto de la biblioteca (Title)
   */
  borrarBiblioteca(nombreBiblioteca: string): Observable<boolean> {
    return this.getRequestDigest().pipe(
      switchMap(digest => {
        const url = `${this.utils.urlApi()}/getbytitle('${nombreBiblioteca}')`;
        const headers = new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*',
          'X-RequestDigest': digest
        });
        return this.http.post(url, {}, { headers, withCredentials: true }).pipe(
          tap(() => console.log(`🗑️ Biblioteca eliminada: ${nombreBiblioteca}`)),
          map(() => true),
          catchError(err => {
            console.error('❌ Error al eliminar la biblioteca:', err);
            return of(false);
          })
        );
      })
    );
  }

}
