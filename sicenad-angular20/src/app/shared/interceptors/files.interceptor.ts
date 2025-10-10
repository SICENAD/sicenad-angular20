import { HttpInterceptorFn } from '@angular/common/http';

export const filesInterceptor: HttpInterceptorFn = (req, next) => {
  let updatedReq = req;

  const isFileRequest = req.url.includes('/files');
  const isUpload = req.method === 'POST' || req.method === 'PUT';
  const isDownload = req.method === 'GET';

  if (isFileRequest) {
    // Subida de archivos → NO tocar Content-Type
    if (isUpload) {
      updatedReq = req.clone({
        setHeaders: {
          Accept: 'application/json'
        }
      });
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
  updatedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  return next(updatedReq);
};
