import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { ReactiveFormsModule } from '@angular/forms';
import { IconosStore } from '@stores/iconos.store';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { AuthStore } from '@stores/auth.store';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { CalendarioComponent } from '@app/calendarios/components/calendario/calendario.component';
import { FiltroRecursosComponent } from "@app/recursos/components/filtroRecursos/filtroRecursos.component";

@Component({
  selector: 'app-calendario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterLink,
    CalendarioComponent,
    FiltroRecursosComponent
  ],
  templateUrl: './calendario-page.component.html',
  styleUrls: ['./calendario-page.component.css'],
  providers: [DatePipe]
})
export class CalendarioPageComponent {
  // Servicios y stores
  private orquestadorService = inject(OrquestadorService);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private auth = inject(AuthStore);

  readonly routesPaths = RoutesPaths;
  /** Icono FontAwesome */
  faVolver = this.iconoStore.faVolver;

  /** Signals para estados */
  recursoSeleccionado = signal<Recurso | null>(null);

  isAutenticado = signal(false);
  isUsuarioNormal = signal(false);
  isAdministrador = signal(false);
  isGestor = signal(false);
  isSuperAdmin = signal(false);

  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  solicitudes = signal<Solicitud[]>([]);

  constructor() {
    //this.initComponent();
  }

  /** Inicialización principal */
  private initComponent() {
    this.comprobarUser();
  }

  /** Comprueba la sesión del usuario */
  private comprobarUser() {
    this.isAutenticado.set(this.auth.isAuthenticated());

    if (!this.isAutenticado()) {
      this.isUsuarioNormal.set(false);
      this.isAdministrador.set(false);
      this.isGestor.set(false);
      this.isSuperAdmin.set(false);
      return;
    }

    this.isAdministrador.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Administrador');
    this.isGestor.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Gestor');
    this.isUsuarioNormal.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Normal');
    this.isSuperAdmin.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Superadministrador');
  }

  recursosFiltrados: Recurso[] = [];

  actualizarRecursosFiltrados(lista: Recurso[]) {
    this.recursosFiltrados = lista;
    console.log('Recursos filtrados desde el hijo:', lista);
  }

  seleccionarRecurso(id: string) {
    const recurso = this.recursosFiltrados.find(r => r.idString === id) || null;
    this.recursoSeleccionado.set(recurso);
    this.cargarEventosDeRecurso(recurso!.idString);
  }

  cargarEventosDeRecurso(idRecurso: string) {
    this.orquestadorService.loadSolicitudesDeRecurso(idRecurso).subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes ?? []);
      },
      error: (err) => {
        console.error('Error cargando solicitudes de recurso', err);
        this.solicitudes.set([]);
      }
    });
  }

}
