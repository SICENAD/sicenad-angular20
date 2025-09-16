import { Routes } from '@angular/router';
import { RegisterComponent } from './login-register/pages/register-page/register-page.component';
import { LoginComponent } from './login-register/pages/login-page/login-page.component';
import { HomeComponent } from '@app/home-cenads_provincia/pages/home-page/home-page.component';
import { CenadPageComponent } from './cenad-visitado/pages/cenad-page/cenad-page.component';
import { CenadHomeComponent } from './cenad-visitado/components/cenad-home/cenad-home.component';
import { NotFoundComponent } from '@shared/components/core/not-found/not-found.component';
import { authGuard } from '@shared/guards/auth.guard';
import { superadministradorGuard } from '@shared/guards/superadministrador.guard';
import { adminCenadGuard } from '@shared/guards/adminCenad.guard';

//uso "alias" para las rutas para desde el resto del codigo llamar a estas constantes y si en un futuro modificamos los path de las rutas solo habra que modificar esta constante y nada de los componentes que usan los RouterLinks...
export const RoutesPaths = {
  home: '/',
  register: '/register',
  login: '/login',
  superadministrador: '/superadministrador',
  armas: 'armas',
  categoriasFichero: 'categoriasFichero',
  tiposFormulario: 'tiposFormulario',
  cenads: 'cenads',
  usuariosSuper: 'usuarios',
  unidadesSuper: 'unidades',
  cenadHome: '/cenad',
  infoCenad: 'infoCenad',
  normativas: 'normativas',
  cartografias: 'cartografias',
  categorias: 'categorias',
  recursos: 'recursos',
  solicitudes: 'solicitudes',
  calendario: 'calendario',
  usuariosCenad: 'usuarios',
  unidadesCenad: 'unidades',
  notFound: '/not-found'

};

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'superadministrador',
    loadComponent: () => import('./superadministrador/pages/superadministrador-page/superadministrador-page.component').then(m => m.SuperadministradorPageComponent),
    canActivate: [authGuard],
    canMatch: [superadministradorGuard],
    children: [
      {
        path: '',
        //component: CenadsPageComponent
        redirectTo: RoutesPaths.cenads,
        pathMatch: 'full'
      },
      {
        path: RoutesPaths.armas,
        loadComponent: () => import('./armas/pages/armas-page/armas-page.component').then(m => m.ArmasPageComponent)
      },
      {
        path: RoutesPaths.categoriasFichero,
        loadComponent: () => import('./categoriasFichero/pages/categoriasFichero-page/categoriasFichero-page.component').then(m => m.CategoriasFicheroPageComponent)
      },
      {
        path: RoutesPaths.tiposFormulario,
        loadComponent: () => import('./tiposFormulario/pages/tiposFormulario-page/tiposFormulario-page.component').then(m => m.TiposFormularioPageComponent)
      },
      {
        path: RoutesPaths.cenads,
        loadComponent: () => import('./cenads/pages/cenads-page/cenads-page.component').then(m => m.CenadsPageComponent)
      },
      {
        path: RoutesPaths.usuariosSuper,
        loadComponent: () => import('./usuarios/pages/usuarios-page/usuarios-page.component').then(m => m.UsuariosPageComponent)
      },
      {
        path: RoutesPaths.unidadesSuper,
        loadComponent: () => import('./unidades/pages/unidades-page/unidades-page.component').then(m => m.UnidadesPageComponent)
      }
    ]
  },
  {
    path: 'cenad/:idCenad',
    component: CenadPageComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: CenadHomeComponent
      },
      {
        path: RoutesPaths.infoCenad,
        loadComponent: () => import('./infoCenad/pages/infoCenad-page/infoCenad-page.component').then(m => m.InfoCenadPageComponent)
      },
      {
        path: RoutesPaths.normativas,
        loadComponent: () => import('./normativas/pages/normativas-page/normativas-page.component').then(m => m.NormativasPageComponent)
      },
      {
        path: RoutesPaths.cartografias,
        loadComponent: () => import('./cartografias/pages/cartografias-page/cartografias-page.component').then(m => m.CartografiasPageComponent)
      },
      {
        path: RoutesPaths.categorias,
        canActivate: [adminCenadGuard],
        loadComponent: () => import('./categorias/pages/categorias-page/categorias-page.component').then(m => m.CategoriasPageComponent)
      },
      {
        path: RoutesPaths.recursos,
        loadComponent: () => import('./recursos/pages/recursos-page/recursos-page.component').then(m => m.RecursosPageComponent)
      },
      {
        path: `${RoutesPaths.recursos}/:idRecurso`,
        loadComponent: () => import('./recursos/pages/recursoDetalle-page/recursoDetalle-page.component').then(m => m.RecursoDetallePageComponent)
      },
      {
        path: RoutesPaths.solicitudes,
        loadComponent: () => import('./solicitudes/pages/solicitudes-page/solicitudes-page.component').then(m => m.SolicitudesPageComponent)
      },
      {
        path: `${RoutesPaths.solicitudes}/:idSolicitud`,
        loadComponent: () => import('./solicitudes/pages/solicitudDetalle-page/solicitudDetalle-page.component').then(m => m.SolicitudDetallePageComponent)
      },
      {
        path: RoutesPaths.calendario,
        component: LoginComponent
      },
      {
        path: RoutesPaths.usuariosCenad,
        canActivate: [adminCenadGuard],
        loadComponent: () => import('./usuarios/pages/usuarios-page/usuarios-page.component').then(m => m.UsuariosPageComponent)
      },
      {
        path: RoutesPaths.unidadesCenad,
        canActivate: [adminCenadGuard],
        loadComponent: () => import('./unidades/pages/unidades-page/unidades-page.component').then(m => m.UnidadesPageComponent)
      }
    ]
  },
  {
    path: "not-found",
    component: NotFoundComponent,
  },
  {
    path: "**",
    redirectTo: "not-found"
  }
];
