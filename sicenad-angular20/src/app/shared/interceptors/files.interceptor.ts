import { HttpInterceptorFn } from '@angular/common/http';

export const filesInterceptor: HttpInterceptorFn = (req, next) => {
  let updatedReq = req;

  if (req.url.includes('/files')) {
    // Subida de archivos: método POST o PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      // ❌ NO poner Content-Type, el navegador lo maneja
      return next(updatedReq);
    }

    // Descarga de archivos: método GET
    if (req.method === 'GET') {
      updatedReq = updatedReq.clone({
        responseType: 'blob' as 'json'
      });
    }

    return next(updatedReq);
  } else {
    // Peticiones normales
    updatedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  return next(updatedReq);
};
