import { HttpInterceptorFn } from '@angular/common/http';

export const filesInterceptor: HttpInterceptorFn = (req, next) => {
  let updatedReq = req;

  // Detectamos si la URL contiene '/files'
  if (req.url.includes('/files')) {
    // ✅ Subida de archivos (POST o PUT)
    if ((req.method === 'POST' || req.method === 'PUT') && req.body instanceof FormData) {
      // ⚠️ No forzamos Content-Type ni Accept
      // El navegador gestionará automáticamente el boundary
      return next(req);
    }

    // ✅ Descarga de archivos (GET)
    if (req.method === 'GET') {
      updatedReq = req.clone({
        responseType: 'blob' as 'json',
      });
      return next(updatedReq);
    }

    // Cualquier otro método (DELETE, etc.)
    return next(req);
  }

  // ✅ Peticiones normales (JSON)
  updatedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return next(updatedReq);
};
