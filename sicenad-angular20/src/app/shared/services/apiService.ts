import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import {
  catchError,
  map,
  Observable,
  throwError,
  switchMap,
  from,
  of,
  concatMap,
  toArray,
  forkJoin,
  tap,
  firstValueFrom,
} from 'rxjs';
import { UtilsStore } from '@stores/utils.store';
import { UtilService } from './utilService';
import { LocalStorageService } from './localStorageService';
import { IdiomaService } from './idiomaService';

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

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private async logSharePointFileSizeLimitFromError(err: any) {
    try {
      let msg = '';
      if (!err) return;
      if (typeof err === 'string') msg = err;
      else if (err.message) msg = err.message;
      else msg = JSON.stringify(err);

      const m = msg.match(/Chained=\(Value=(\d+)\)/i) || msg.match(/Value=(\d{6,})/i);
      if (m && m[1]) {
        const bytes = parseInt(m[1], 10);
        if (!isNaN(bytes) && bytes > 0) {
          const human = this.humanFileSize(bytes);
          const message = `SharePoint reporta un límite aproximado de archivo: ${bytes} bytes (${human}).`;
          console.warn(message);
          return;
        }
      }

      if (/FileTooLarge|FileTooBig|File is too large/i.test(msg)) {
        const mensaje = this.idiomaService.t('archivos.tooSize');
        console.warn(mensaje, msg);
        try {
          this.utilService.toast(mensaje, 'warning');
        } catch { }
      }
    } catch (e) {
      // ignore
    }
  }

  private humanFileSize(bytes: number): string {
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';
    const units = ['KB', 'MB', 'GB', 'TB'];
    let u = -1;
    let b = bytes;
    do {
      b /= thresh;
      ++u;
    } while (Math.abs(b) >= thresh && u < units.length - 1);
    return b.toFixed(2) + ' ' + units[u];
  }

  // Determina si debemos enviar credenciales cross-site.
  // Usamos la recomendación resuelta en UtilsStore ('same-origin' | 'include').
  private getWithCredentialsFlag(): boolean {
    try {
      return this.utils.credentialsRecommendation() === 'include';
    } catch (e) {
      // Si por alguna razón no está disponible, ser conservador y enviar credenciales
      return true;
    }
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
    body?: any
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
          map((result) => result as unknown as T)
        );
        break;
      case 'PATCH':
        if (!body?.Id) {
          return throwError(() => new Error('No se indicó ID para PATCH'));
        }
        observable = from(this.editarElemento(body.Id, endpoint, body)).pipe(
          map((result) => result as unknown as T)
        );
        break;
      case 'DELETE':
        if (!body?.Id) {
          return throwError(() => new Error('No se indicó ID para DELETE'));
        }
        observable = from(this.eliminarElemento(body.Id, endpoint)).pipe(
          map((result) => result as unknown as T)
        );
        break;
      case 'GET':
        // Si la URL corresponde a un elemento individual (/items(<id>)) usamos getElemento
        if (typeof endpoint === 'string' && /items\(/i.test(endpoint)) {
          observable = this.getElemento(endpoint) as Observable<T>;
        } else {
          observable = this.getListaElementos(endpoint) as Observable<T>;
        }
        break;
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
      catchError((err) => {
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

  subirArchivo(urlUpload: string, archivo: File): Observable<any> {
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
    const headers = new HttpHeaders({ Accept: 'application/json;odata=verbose' });
    return this.http
      .post<any>(url, {}, { headers, withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        map((res: any) => res?.d?.GetContextWebInformation?.FormDigestValue),
        catchError((err) => {
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
    const headers = new HttpHeaders({ Accept: 'application/json;odata=verbose' });
    return this.http
      .get<any>(url, { headers, withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        map((res) => res?.d?.ListItemEntityTypeFullName ?? ''),
        catchError((err) => {
          console.error('Error al obtener EntityTypeFullName:', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * Obtiene elementos de una lista (con url completa o personalizada)
   */
  getListaElementos(url: string): Observable<any[]> {
    const headers = new HttpHeaders({ Accept: 'application/json;odata=verbose' });
    return this.http
      .get<any>(url, { headers, withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        map((res) => this.utilService.ensureArray<any>(res)),
        catchError((err) => {
          console.error('Error al obtener lista de elementos', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * Obtiene un único elemento (por ejemplo /items(123)) devolviendo res.d
   */
  getElemento(url: string): Observable<any> {
    const headers = new HttpHeaders({ Accept: 'application/json;odata=verbose' });
    return this.http
      .get<any>(url, { headers, withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        map((res) => this.utilService.ensureObject<any>(res)),
        catchError((err) => {
          console.error('Error al obtener elemento', err);
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
    const query = [filterParam, selectParam].filter((p) => p).join('&');
    const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items${query ? '?' + query : ''
      }`;
    const headers = new HttpHeaders({
      Accept: 'application/json;odata=verbose',
    });
    return this.http
      .get<any>(url, { headers, withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        catchError((err) => {
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
      switchMap((entityType) =>
        this.getRequestDigest().pipe(
          switchMap((digest) => {
            const body = {
              __metadata: { type: entityType },
              ...elemento,
            };
            const headers = new HttpHeaders({
              Accept: 'application/json;odata=verbose',
              'Content-Type': 'application/json;odata=verbose',
              'X-RequestDigest': digest,
            });
            const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items`;
            return this.http
              .post<any>(url, body, { headers, withCredentials: this.getWithCredentialsFlag() })
              .pipe(
                map((res) => res?.d),
                catchError((err) => {
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
      switchMap((entityType) =>
        this.getRequestDigest().pipe(
          switchMap((digest) => {
            const body = {
              __metadata: { type: entityType },
              ...elemento,
            };
            const headers = new HttpHeaders({
              Accept: 'application/json;odata=verbose',
              'Content-Type': 'application/json;odata=verbose',
              'X-RequestDigest': digest,
              'X-HTTP-Method': 'MERGE',
              'IF-MATCH': '*',
            });
            const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`;
            return this.http
              .post<any>(url, body, { headers, withCredentials: this.getWithCredentialsFlag() })
              .pipe(
                switchMap(() =>
                  // Después del MERGE, pedimos el elemento actualizado
                  this.http.get<any>(
                    `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`,
                    {
                      headers: new HttpHeaders({ Accept: 'application/json;odata=verbose' }),
                      withCredentials: this.getWithCredentialsFlag(),
                    }
                  )
                ),
                map((res) => res.d),
                catchError((err) => {
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
      switchMap((digest) => {
        const headers = new HttpHeaders({
          Accept: 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*',
          'X-RequestDigest': digest,
        });
        const url = `${this.utils.urlApi()}/getbytitle('${nombreLista}')/items(${id})`;
        return this.http
          .post<any>(url, {}, { headers, withCredentials: this.getWithCredentialsFlag() })
          .pipe(
            map(() => true),
            catchError((err) => {
              console.error('Error al eliminar elemento:', err);
              return of(false);
            })
          );
      })
    );
  }

  // ------------------ ARCHIVOS (SharePoint Foundation 2019) ------------------

  /**
   * 📤 Sube un archivo a SharePoint (compatible con tu API antigua)
   * @param urlUpload Ruta relativa dentro del sitio (puede incluir biblioteca + subcarpetas)
   * @param archivo Archivo a subir
   */
  subirArchivoSharePoint(urlUpload: string, archivo: File, overwrite = true): Observable<string> {
    // Usar subida por chunks si el archivo supera 1 MB
    const CHUNK_THRESHOLD = 1 * 1024 * 1024; // 1 MB
    if (archivo.size > CHUNK_THRESHOLD) {
      return this.subirArchivoSharePointChunked(urlUpload, archivo, overwrite, 1 * 1024 * 1024);
    }
    return this.getRequestDigest().pipe(
      switchMap((digest) => {
        // Separar biblioteca y posibles subcarpetas
        const parts = urlUpload.split('/').filter((p) => p.trim().length > 0);
        const libraryName = parts.shift()!; // primera parte es la biblioteca
        const folderPath = parts.join('/'); // resto es la ruta dentro de la biblioteca
        // Crear carpetas si no existen
        return this.crearCarpetasSiNoExisten(libraryName, folderPath, digest).pipe(
          switchMap(() =>
            from(archivo.arrayBuffer()).pipe(
              switchMap(async (buffer) => {
                const baseFolder = folderPath
                  ? `${libraryName}/${folderPath}`.replace(/\\/g, '/')
                  : libraryName;
                const url = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${baseFolder}')/Files/add(url='${archivo.name
                  }',overwrite=${overwrite})`;
                try {
                  const response = await fetch(url, {
                    method: 'POST',
                    body: buffer,
                    headers: {
                      Accept: 'application/json;odata=verbose',
                      'X-RequestDigest': digest,
                      'Content-Type': 'application/octet-stream',
                    },
                    // Use the UtilsStore recommendation: 'same-origin' or 'include'
                    credentials: this.utils.credentialsRecommendation() as RequestCredentials,
                  });
                  if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    // Intentar eliminar placeholder parcial en el servidor
                    try {
                      const relPath = folderPath ? `${folderPath}/${archivo.name}` : archivo.name;
                      await firstValueFrom(this.borrarArchivoSharePoint(libraryName, relPath));
                      console.warn('[SP Upload] placeholder eliminado tras fallo:', relPath);
                    } catch (delErr) {
                      console.warn('[SP Upload] fallo al eliminar placeholder tras fallo:', delErr);
                    }
                    throw new Error(`Error ${response.status}: ${text}`);
                  }
                  const data = await response.json();
                  return data;
                } catch (err) {
                  // En caso de excepciones (network, timeouts, etc.) intentar borrar placeholder
                  try {
                    const relPath = folderPath ? `${folderPath}/${archivo.name}` : archivo.name;
                    await firstValueFrom(this.borrarArchivoSharePoint(libraryName, relPath));
                    console.warn('[SP Upload] placeholder eliminado tras excepción:', relPath);
                  } catch (delErr) {
                    console.warn(
                      '[SP Upload] fallo al eliminar placeholder tras excepción:',
                      delErr
                    );
                  }
                  throw err;
                }
              })
            )
          )
        );
      }),
      catchError((err) => {
        console.error('Error en subir archivo con fecth : ', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Subida por fragmentos (StartUpload / ContinueUpload / FinishUpload) usando chunkSize por defecto 1MB
   */
  subirArchivoSharePointChunked(
    urlUpload: string,
    archivo: File,
    overwrite = true,
    chunkSize = 1 * 1024 * 1024
  ): Observable<any> {
    return new Observable<any>((subscriber) => {
      (async () => {
        // variables en scope para el catch
        let libraryName: string | null = null;
        let folderPath: string | null = null;
        let serverRelative: string | null = null;
        let digestVal: string | null = null;
        let uploadId: string | null = null; // declarado en scope exterior para poder cerrarlo en el catch
        try {
          const digest = (digestVal = await firstValueFrom(this.getRequestDigest()));
          const parts = urlUpload.split('/').filter((p) => p.trim().length > 0);
          libraryName = parts.shift()!;
          folderPath = parts.join('/');
          await firstValueFrom(this.crearCarpetasSiNoExisten(libraryName, folderPath, digest));
          const baseFolder = folderPath
            ? `${libraryName}/${folderPath}`.replace(/\\/g, '/')
            : libraryName;
          serverRelative = `${this.utils.webServerRelativeUrl()}/${baseFolder}/${archivo.name}`
            .replace(/\\/g, '/')
            .replace(/\/\/+/g, '/');
          // Crear placeholder vacío
          try {
            const addUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${baseFolder}')/Files/add(url='${archivo.name
              }',overwrite=${overwrite})`;
            const zero = new Uint8Array(0);
            const resAdd = await fetch(addUrl, {
              method: 'POST',
              body: zero,
              headers: {
                Accept: 'application/json;odata=verbose',
                'X-RequestDigest': digest,
                'Content-Type': 'application/octet-stream',
              },
              credentials: this.utils.credentialsRecommendation() as RequestCredentials,
            });
            if (!resAdd.ok) {
              if (resAdd.status !== 409 && resAdd.status !== 201 && resAdd.status !== 200) {
                const txt = await resAdd.text().catch(() => '');
                throw new Error(`Error creando placeholder: ${resAdd.status}: ${txt}`);
              }
            }
          } catch (err) {
            throw err;
          }
          uploadId = this.generateGuid();
          try {
            const mensaje = await this.idiomaService.tVars('archivos.subiendo', { archivo: `${archivo.name}` });
            this.utilService.blockingProgressStart(uploadId, mensaje);
          } catch { }
          const totalSize = archivo.size;
          try {
            this.localStorageService.resetExpiry();
          } catch { }
          let offset = 0;
          let isFirst = true;
          let chunkIndex = 0;
          let json: any = null;
          while (offset < totalSize) {
            const start = offset;
            const end = Math.min(offset + chunkSize, totalSize);
            const blob = archivo.slice(start, end);
            const buffer = await blob.arrayBuffer();
            let opUrl: string;
            if (isFirst)
              opUrl = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${serverRelative}')/StartUpload(uploadId=guid'${uploadId}')`;
            else if (end < totalSize)
              opUrl = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${serverRelative}')/ContinueUpload(uploadId=guid'${uploadId}',fileOffset=${offset})`;
            else
              opUrl = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${serverRelative}')/FinishUpload(uploadId=guid'${uploadId}',fileOffset=${offset})`;
            const maxAttempts = 5;
            let attempt = 0;
            let success = false;
            let lastErr: any = null;
            while (attempt < maxAttempts && !success) {
              attempt++;
              try {
                try {
                  console.debug('[SP Upload] chunk', {
                    uploadId,
                    chunkIndex,
                    attempt,
                    start,
                    end,
                    chunkSize,
                    totalSize,
                    opUrl,
                  });
                } catch { }
                const response = await fetch(opUrl, {
                  method: 'POST',
                  body: buffer,
                  headers: {
                    Accept: 'application/json;odata=verbose',
                    'X-RequestDigest': digest,
                    'Content-Type': 'application/octet-stream',
                  },
                  credentials: this.utils.credentialsRecommendation() as RequestCredentials,
                });
                if (!response.ok) {
                  const text = await response.text().catch(() => '');
                  console.warn('[SP Upload] chunk failed', {
                    uploadId,
                    chunkIndex,
                    attempt,
                    status: response.status,
                    text: text.slice ? text.slice(0, 2000) : text,
                  });
                  try {
                    this.logSharePointFileSizeLimitFromError(text);
                  } catch { }
                  throw new Error(`Chunk upload error ${response.status}: ${text}`);
                }
                const respText = await response.text().catch(() => '');
                let returnedOffset: number | null = null;
                if (respText) {
                  try {
                    const parsed = JSON.parse(respText);
                    const findNumbers = (o: any, acc: number[] = []): number[] => {
                      if (o == null) return acc;
                      if (typeof o === 'number' && Number.isFinite(o)) acc.push(Math.floor(o));
                      else if (typeof o === 'string') {
                        const m = o.match(/(\d{5,})/g);
                        if (m) m.forEach((x: string) => acc.push(parseInt(x, 10)));
                      } else if (Array.isArray(o)) o.forEach((v) => findNumbers(v, acc));
                      else if (typeof o === 'object')
                        Object.values(o).forEach((v) => findNumbers(v, acc));
                      return acc;
                    };
                    const nums = findNumbers(parsed, []);
                    if (nums.length) {
                      const candidats = nums.filter((n) => n > 0 && n <= totalSize);
                      if (candidats.length) returnedOffset = Math.max(...candidats);
                    }
                    if (end >= totalSize) json = parsed;
                  } catch (e) {
                    const m = respText.match(/(\d{5,})/g);
                    if (m && m.length) {
                      const nums = m
                        .map((x) => parseInt(x, 10))
                        .filter((n) => !isNaN(n) && n > 0 && n <= totalSize);
                      if (nums.length) returnedOffset = Math.max(...nums);
                      if (end >= totalSize) {
                        try {
                          json = JSON.parse(respText);
                        } catch {
                          json = null;
                        }
                      }
                    }
                  }
                } else {
                  if (end >= totalSize) json = null;
                }
                try {
                  this.localStorageService.resetExpiry();
                } catch { }
                if (returnedOffset && returnedOffset > 0 && returnedOffset <= totalSize)
                  offset = returnedOffset;
                else offset = end;
                success = true;
              } catch (err) {
                lastErr = err;
                await new Promise((r) => setTimeout(r, attempt * 500));
              }
            }
            if (!success) throw lastErr;
            isFirst = false;
            chunkIndex++;
            try {
              const percent = Math.min(100, Math.round((offset / totalSize) * 100));
              try {
                if (uploadId) {
                  const mensaje = await this.idiomaService.tVars('archivos.subiendo', { archivo: `${archivo.name}` });
                  this.utilService.blockingProgressUpdate(
                    uploadId,
                    `${mensaje} ${percent}%`
                  );
                }
              } catch { }
              if (end >= totalSize) {
                try {
                  if (uploadId) {
                    const mensaje = this.idiomaService.t('archivos.exitoSubida');
                    this.utilService.blockingProgressComplete(uploadId, mensaje);
                  }
                } catch { }
              }
            } catch { }
          }
          try {
            const finalResult = json?.d ? json : { d: json };
            subscriber.next(finalResult);
          } catch { }
          subscriber.complete();
        } catch (err) {
          // intentar eliminar placeholder por serverRelative
          try {
            if (serverRelative) {
              try {
                const digestToUse = digestVal
                  ? digestVal
                  : await firstValueFrom(this.getRequestDigest());
                const delUrl = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${serverRelative}')`;
                const res = await fetch(delUrl, {
                  method: 'POST',
                  headers: {
                    'X-RequestDigest': digestToUse,
                    'X-HTTP-Method': 'DELETE',
                    'IF-MATCH': '*',
                  },
                  credentials: this.utils.credentialsRecommendation() as RequestCredentials,
                });
                if (!res.ok) {
                  const txt = await res.text().catch(() => '');
                  console.warn('[SP Upload] fallo al eliminar placeholder por serverRelative', {
                    serverRelative,
                    status: res.status,
                    text: txt.slice ? txt.slice(0, 2000) : txt,
                  });
                } else {
                  console.warn(
                    '[SP Upload] placeholder eliminado (serverRelative):',
                    serverRelative
                  );
                }
              } catch (delErr) {
                console.warn(
                  '[SP Upload] excepcion al eliminar placeholder por serverRelative:',
                  delErr
                );
              }
            } else if (libraryName) {
              try {
                const relPath = folderPath ? `${folderPath}/${archivo.name}` : archivo.name;
                await firstValueFrom(this.borrarArchivoSharePoint(libraryName, relPath));
                console.warn('[SP Upload] placeholder eliminado (fallback):', relPath);
              } catch (delErr) {
                console.warn('[SP Upload] fallo al eliminar placeholder (fallback):', delErr);
              }
            } else {
              console.warn(
                '[SP Upload] no se dispone de serverRelative ni libraryName para eliminar placeholder'
              );
            }
          } catch (e) { }
          try {
            this.logSharePointFileSizeLimitFromError(err);
          } catch { }
          // Mostrar overlay de error y permitir cierre
          try {
            const mensaje = this.idiomaService.t('archivos.errorSubida');
            const errMsg =
              err && (err as any).message
                ? String((err as any).message)
                : String(err || mensaje);
            if (uploadId) {
              try {
                this.utilService.blockingProgressError(uploadId, errMsg, archivo.name);
              } catch { }
            }
          } catch (e) { }
          subscriber.error(err);
        }
      })();
    });
  }

  /**
   * 🗂️ Crea carpetas intermedias si no existen (Observable)
   */
  crearCarpetasSiNoExisten(
    libraryName: string,
    folderPath: string,
    digest: string
  ): Observable<void> {
    if (!folderPath) return of(void 0);
    const parts = folderPath.split('/').filter((p) => p.trim().length > 0);
    let currentPath = libraryName;
    return from(parts).pipe(
      concatMap((part) => {
        const folderUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${currentPath}')/folders/add('${part}')`;
        const headers = new HttpHeaders({
          Accept: 'application/json;odata=verbose',
          'X-RequestDigest': digest,
        });
        return this.http
          .post<any>(folderUrl, {}, { headers, withCredentials: this.getWithCredentialsFlag() })
          .pipe(
            catchError((err) => {
              if (err.status === 409) return of(void 0); // carpeta ya existe
              console.error(`⚠️ Error al crear carpeta '${part}':`, err);
              return throwError(() => err);
            }),
            tap(() => {
              currentPath += `/${part}`;
            })
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
    return this.http
      .get(fileUrl, { responseType: 'blob', withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        map((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = relativePath.split('/').pop()!;
          a.click();
          window.URL.revokeObjectURL(url);
        }),
        map(() => void 0),
        catchError((err) => {
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
    const url = `${this.utils.urlSitio()}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(
      this.utils.urlSitio() + '/' + libraryName + '/' + relativePath
    )}`;
    return this.http
      .get(url, { responseType: 'blob', withCredentials: this.getWithCredentialsFlag() })
      .pipe(
        catchError((err) => {
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
      switchMap((digest) => {
        const url = `${this.utils.urlSitio()}/_api/web/GetFileByServerRelativeUrl('${this.utils.webServerRelativeUrl()}/${libraryName}/${relativePath}')`;
        const headers = new HttpHeaders({
          Accept: 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*',
          'X-RequestDigest': digest,
        });
        return this.http
          .post<any>(url, {}, { headers, withCredentials: this.getWithCredentialsFlag() })
          .pipe(
            map(() => {
              return true;
            }),
            catchError((err) => {
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
      switchMap((digest) =>
        this._borrarCarpetaRecursivaInterna(nombreBiblioteca, rutaCarpeta, digest)
      ),
      catchError((err) => {
        console.error('Error al borrar carpeta recursiva:', err);
        return of(false);
      })
    );
  }

  /**
   * Método interno recursivo para borrar carpeta
   */
  private _borrarCarpetaRecursivaInterna(
    nombreBiblioteca: string,
    rutaCarpeta: string,
    digest: string
  ): Observable<boolean> {
    // ServerRelativeUrl debe ser relativo al web, no incluir el prefix de urlSitio aquí.
    // Las demás funciones de subida/creación usan 'LibraryName/folder/subfolder' como serverRelativeUrl.
    const carpetaUrl = `${nombreBiblioteca}/${rutaCarpeta}`
      .replace(/\/+/g, '/')
      .replace(/^\/+/, '');
    const getFoldersUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')/Folders`;
    const getFilesUrl = `${this.utils.urlSitio()}/_api/web/GetFolderByServerRelativeUrl('${carpetaUrl}')/Files`;
    // 1️⃣ Obtener subcarpetas y archivos
    const folders$ = this.http
      .get<any>(getFoldersUrl, {
        headers: new HttpHeaders({ Accept: 'application/json;odata=verbose' }),
        withCredentials: this.getWithCredentialsFlag(),
      })
      .pipe(
        map((res) => res?.d?.results ?? []),
        catchError(() => of([]))
      );
    const files$ = this.http
      .get<any>(getFilesUrl, {
        headers: new HttpHeaders({ Accept: 'application/json;odata=verbose' }),
        withCredentials: this.getWithCredentialsFlag(),
      })
      .pipe(
        map((res) => res?.d?.results ?? []),
        catchError(() => of([]))
      );
    return forkJoin([folders$, files$]).pipe(
      switchMap(([subcarpetas, archivos]) => {
        // 2️⃣ Borrar archivos
        const borrarArchivos$ = from(archivos).pipe(
          concatMap((file: any) => {
            // Normalizamos la ruta relativa: eliminamos el prefijo urlSitio() si existe
            // y cualquier slash inicial para evitar 'libraryName//subpath' en las llamadas
            let rel = file.ServerRelativeUrl || '';
            rel = rel.replace(`${this.utils.urlSitio()}/`, '');
            rel = rel.replace(/^\/+/, '');
            return this.borrarArchivoSharePoint(nombreBiblioteca, rel);
          }),
          toArray()
        );
        // 3️⃣ Borrar subcarpetas recursivamente
        const borrarSubcarpetas$ = from(subcarpetas).pipe(
          concatMap((sub: any) => {
            let subRuta = sub.ServerRelativeUrl || '';
            subRuta = subRuta.replace(`${this.utils.urlSitio()}/${nombreBiblioteca}/`, '');
            subRuta = subRuta.replace(/^\/+/, '');
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
              'X-RequestDigest': digest,
            });
            return this.http
              .post<any>(url, {}, { headers, withCredentials: this.getWithCredentialsFlag() })
              .pipe(
                map(() => true),
                catchError(() => of(false))
              );
          })
        );
      })
    );
  }

  /**
   * Crea una biblioteca de documentos en el sitio (lista con BaseTemplate = 101)
   * @param nombre Nombre de la biblioteca a crear con el nombre de la entidad (cenad.nombre)
   */
  crearBibliotecaDocumentos(nombre: string): Observable<any> {
    return this.getRequestDigest().pipe(
      switchMap((digest) => {
        const url = `${this.utils.urlApi()}`;
        const body = {
          __metadata: { type: 'SP.List' },
          Title: nombre,
          BaseTemplate: 101,
          AllowContentTypes: true,
          ContentTypesEnabled: true,
        };
        const headers = new HttpHeaders({
          Accept: 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest,
        });
        return this.http
          .post<any>(url, body, { headers, withCredentials: this.getWithCredentialsFlag() })
          .pipe(
            map((res) => res?.d),
            catchError((err) => {
              console.error('Error al crear biblioteca de documentos:', err);
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
  borrarBibliotecaDocumentos(nombreBiblioteca: string): Observable<boolean> {
    return this.getRequestDigest().pipe(
      switchMap((digest) => {
        const url = `${this.utils.urlApi()}/getbytitle('${nombreBiblioteca}')`;
        const headers = new HttpHeaders({
          Accept: 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*',
          'X-RequestDigest': digest,
        });
        return this.http
          .post(url, {}, { headers, withCredentials: this.getWithCredentialsFlag() })
          .pipe(
            map(() => true),
            catchError((err) => {
              console.error('❌ Error al eliminar la biblioteca:', err);
              return of(false);
            })
          );
      })
    );
  }
}
