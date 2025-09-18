// src/app/interceptors/files.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const filesInterceptor: HttpInterceptorFn = (req, next) => {
  let updatedReq = req;
  // Detectamos si la URL contiene '/files'
  if (req.url.includes('/files')) {
    // Subida de archivos: método POST o PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      updatedReq = updatedReq.clone({
        setHeaders: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    // Descarga de archivos: método GET
    if (req.method === 'GET') {
      updatedReq = updatedReq.clone({
        responseType: 'blob' as 'json'
      });
    }
    return next(updatedReq);
  } else {
    // Si no es una URL de archivos, le ponemos las cabeceras correspondientes a JSON
    updatedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
  return next(updatedReq);
};
