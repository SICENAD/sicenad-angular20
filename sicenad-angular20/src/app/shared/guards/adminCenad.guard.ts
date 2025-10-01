import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { RoutesPaths } from "@app/app.routes";
import { RolUsuario } from "@interfaces/enums/rolUsuario.enum";
import { IdiomaService } from "@services/idiomaService";
import { UsuarioLogueadoStore } from "@stores/usuarioLogueado.store";

export const adminCenadGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  const idiomaService = inject(IdiomaService);
  

  const idCenad = route.parent?.paramMap.get('idCenad');

  if (!idCenad) return router.createUrlTree([RoutesPaths.home]);

  const usuario = usuarioLogueadoStore.usuarioLogueado();
  const cenadPropio = usuarioLogueadoStore.cenadPropio();

  if (usuario?.rol === RolUsuario.Administrador && cenadPropio?.idString === idCenad) {
    return true;
  } else {
    alert(idiomaService.t('administracion.debesAdminCenad'));
    return router.createUrlTree([RoutesPaths.home]);
  }
};


