import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';

export const superadministradorGuard = (): CanMatchFn => () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    return auth.rol() === RolUsuario.Superadministrador ? true : (alert(`Debes ser ${RolUsuario.Superadministrador} para acceder a esta página`), router.createUrlTree([RoutesPaths.home]));
  }
