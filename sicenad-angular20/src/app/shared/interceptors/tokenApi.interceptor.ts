import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@stores/auth.store';

export const tokenApiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.token();
  if (token) {
    const authReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
    return next(authReq);
  }
  return next(req);
};
