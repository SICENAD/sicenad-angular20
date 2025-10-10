import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environment';

export const filesInterceptor: HttpInterceptorFn = (req, next) => {
  let updatedReq = req;
  const isFileRequest = req.url.includes('/files');
  const isUpload = req.method === 'POST' || req.method === 'PUT';
  const isDownload = req.method === 'GET';
  if (isFileRequest) {
    // Subida de archivos
    if (isUpload) {
      if (environment.entorno === 'netlify') {
        // ⚠️ FORZAR Content-Type: multipart/form-data solo en Netlify
        // Esto **puede romper** la subida si hay FormData grande y el boundary no se genera
        updatedReq = req.clone({
          setHeaders: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json'
          }
        });
      } else {
        // IIS / Dev → dejar que el navegador genere multipart/form-data
        updatedReq = req.clone({
          setHeaders: {
            Accept: 'application/json'
          }
        });
      }
    }
    // Descarga de archivos → responseType blob
    if (isDownload) {
      updatedReq = req.clone({
        responseType: 'blob' as 'json'
      });
    }
    return next(updatedReq);
  }
  // Peticiones normales JSON
  let jsonHeaders: Record<string, string> = { Accept: 'application/json' };
  if (environment.entorno === 'netlify' || environment.forceJsonHeader) {
    jsonHeaders['Content-Type'] = 'application/json';
  }
  updatedReq = req.clone({ setHeaders: jsonHeaders });
  return next(updatedReq);
};
