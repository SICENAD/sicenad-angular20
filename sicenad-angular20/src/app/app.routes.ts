import { Routes } from '@angular/router';
import { RegisterComponent } from './login-register/pages/register-page/register-page.component';
import { LoginComponent } from './login-register/pages/login-page/login-page.component';
import { HomeComponent } from '@app/home-cenads_provincia/pages/home-page/home-page.component';
import { CenadPageComponent } from './cenad-visitado/pages/cenad-page/cenad-page.component';
import { CenadHomeComponent } from './cenad-visitado/components/cenad-home/cenad-home.component';
import { NotFoundComponent } from '@shared/components/core/not-found/not-found.component';
import { CenadsPageComponent } from './cenads/pages/cenads-page/cenads-page.component';
import { SuperadministradorPageComponent } from './superadministrador/pages/superadministrador-page/superadministrador-page.component';
import { ArmasPageComponent } from './armas/pages/armas-page/armas-page.component';
import { UnidadesPageComponent } from './unidades/pages/unidades-page/unidades-page.component';
import { TiposFormularioPageComponent } from './tiposFormulario/pages/tiposFormulario-page/tiposFormulario-page.component';
import { CategoriasFicheroPageComponent } from './categoriasFichero/pages/categoriasFichero-pages/categoriasFichero-page.component';
import { UsuariosPageComponent } from './usuarios/pages/usuarios-page/usuarios-page.component';
import { CartografiasPageComponent } from './cartografias/pages/cartografias-page/cartografias-page.component';
import { NormativasPageComponent } from './normativas/pages/normativas-page/normativas-page.component';
import { InfoCenadComponent } from './infoCenad/pages/infoCenad/infoCenad.component';

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
  solicitudesEstado: 'solicitudes/estado',
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
    component: SuperadministradorPageComponent,
    children: [
      {
        path: '',
       //component: CenadsPageComponent
         redirectTo: RoutesPaths.cenads,
         pathMatch: 'full'
      },
      {
        path: RoutesPaths.armas,
        component: ArmasPageComponent
      },
      {
        path: RoutesPaths.categoriasFichero,
        component: CategoriasFicheroPageComponent
      },
      {
        path: RoutesPaths.tiposFormulario,
        component: TiposFormularioPageComponent
      },
      {
        path: RoutesPaths.cenads,
        component: CenadsPageComponent
      },
      {
        path: RoutesPaths.usuariosSuper,
        component: UsuariosPageComponent
      },
      {
        path: RoutesPaths.unidadesSuper,
        component: UnidadesPageComponent
      }
    ]
  },
  {
    path: 'cenad/:idCenad',
    component: CenadPageComponent,
    children: [
      {
        path: '',
        component: CenadHomeComponent
      },
      {
        path: RoutesPaths.infoCenad,
        component: InfoCenadComponent
      },
      {
        path: RoutesPaths.normativas,
        component: NormativasPageComponent
      },
      {
        path: RoutesPaths.cartografias,
        component: CartografiasPageComponent
      },
      {
        path: RoutesPaths.categorias,
        component: LoginComponent
      },
      {
        path: RoutesPaths.recursos,
        component: LoginComponent
      },
      {
        path: `${RoutesPaths.recursos}/:idRecurso`,
        component: LoginComponent
      },
      {
        path: RoutesPaths.solicitudes,
        component: LoginComponent
      },
      {
        path: `${RoutesPaths.solicitudesEstado}/:estado`,
        component: LoginComponent
      },
      {
        path: `${RoutesPaths.solicitudes}/:idSolicitud`,
        component: LoginComponent
      },
      {
        path: RoutesPaths.calendario,
        component: LoginComponent
      },
      {
        path: RoutesPaths.usuariosCenad,
        component: UsuariosPageComponent
      },
      {
        path: RoutesPaths.unidadesCenad,
        component: UnidadesPageComponent
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
