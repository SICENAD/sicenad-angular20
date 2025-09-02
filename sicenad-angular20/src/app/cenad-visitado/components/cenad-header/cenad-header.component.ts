import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';

@Component({
  selector: 'app-cenad-header',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './cenad-header.component.html',
  styleUrls: ['./cenad-header.component.css'],
})
export class CenadHeaderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);

  faLock = this.iconoStore.faLock;
  faSignOutAlt = this.iconoStore.faSignOutAlt;
  faRecurso = this.iconoStore.faRecurso;
  faConsultar = this.iconoStore.faConsultar;
  faMas = this.iconoStore.faMas;
  faCalendario = this.iconoStore.faCalendario;
  faSolicitar = this.iconoStore.faSolicitar;
  faHome = this.iconoStore.faHome;
  faArtefacto = this.iconoStore.faArtefacto;
  faInfo = this.iconoStore.faInfo;
  faVista = this.iconoStore.faVista;
  faEnlace = this.iconoStore.faEnlace;
  faNormativa = this.iconoStore.faNormativa;
  faMeteo = this.iconoStore.faMeteo;
  faCartografia = this.iconoStore.faCartografia;
  faMenu = this.iconoStore.faMenu;
  faUser = this.iconoStore.faUser;
  faPrevision = this.iconoStore.faPrevision;
  faIPI = this.iconoStore.faIPI;
  faMetozonas = this.iconoStore.faMetozonas;
  faUsuarios = this.iconoStore.faUsuarios;
  faCategorias = this.iconoStore.faCategorias;
  faPeticiones = this.iconoStore.faPeticiones;
  faUnidades = this.iconoStore.faUnidades;

  readonly routesPaths = RoutesPaths;

  cenads = computed(() => this.datosPrincipalesStore.cenads());
  idCenad = computed(() => this.route.snapshot.params['idCenad']);
  cenad = computed(() => this.cenadStore.cenadVisitado());
  isSuperAdmin = computed(() => this.auth.rol() === 'Superadministrador');
  isGestorNormal = computed(() => this.auth.rol() === 'Gestor' || this.auth.rol() === 'Normal');
  isGestorEsteCenad = computed(() => this.auth.rol() === 'Gestor' && this.idCenad() === this.usuarioLogueado.cenadPropio()?.idString);
  isAdminEsteCenad = computed(() => this.auth.rol() === 'Administrador' && this.idCenad() === this.usuarioLogueado.cenadPropio()?.idString);

  idCenadZaragoza = signal<string | null>(null);
  isCenadZaragoza = signal(false);
  menuVisible = signal(false);

  toggleMenu() {
    this.menuVisible.set(!this.menuVisible());
  }

  ngOnInit() {
    this.cenadStore.borrarDatosCenad();
    this.orquestadorService.getDatosDeCenad(this.idCenad()).subscribe();
    this.cargarCenads();
  }

  private cargarCenads() {
    this.buscarIdCenadZaragoza();
    this.comprobarCenadZaragoza();
  }

  private buscarIdCenadZaragoza() {
    for (const c of this.cenads()) {
      if (c.provincia === 50) {
        this.idCenadZaragoza.set(c.idString);
      }
    }
  }

  private comprobarCenadZaragoza() {
    this.isCenadZaragoza.set(this.idCenadZaragoza() === this.idCenad());
  }
}
