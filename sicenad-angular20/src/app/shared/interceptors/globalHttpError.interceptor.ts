import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UtilService } from '@services/utilService';
import { retry, tap } from 'rxjs';

//este no lo usare porque molesta cuando encuentra cenads sin admin o categoriaspadre
export const globalHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const utilService = inject(UtilService);
  return next(req).pipe(
    retry({ count: 3, delay: 1000 }),
    tap({
      error: (error: HttpErrorResponse) => {
        utilService.toast(error.message, 'error');
      }
    })
  );
}
