import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@stores/auth.store';

export const tokenApiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  //const token = localStorage.getItem('token');
  const token = auth.token();
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }
  if (token !== null && token !== '') {
    const updatedReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
    return next(updatedReq);
  }
  return next(req);
};
