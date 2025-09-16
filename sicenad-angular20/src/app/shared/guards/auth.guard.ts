import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { AuthStore } from '@stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const routesPaths = RoutesPaths;

  return auth.isAuthenticated() ? true : router.createUrlTree([routesPaths.login]);
};
