import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { IdiomaService } from '@services/idiomaService';
import { AuthStore } from '@stores/auth.store';

export const superadministradorGuard: CanMatchFn = () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    const idiomaService = inject(IdiomaService);
    return auth.rol() === RolUsuario.Superadministrador ? true : (alert(idiomaService.t('administracion.debesSerSuperadmin')), router.createUrlTree([RoutesPaths.home]));
  }
