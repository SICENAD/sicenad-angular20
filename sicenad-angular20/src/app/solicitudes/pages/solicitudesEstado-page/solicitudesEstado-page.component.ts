import { Component, computed, inject, input, signal } from '@angular/core';
import { SolicitudComponent } from '@app/solicitudes/components/solicitud/solicitud.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Solicitud } from '@interfaces/models/solicitud';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';

@Component({
  selector: 'app-solicitudesEstado',
  imports: [FontAwesomeModule, SolicitudComponent],
  templateUrl: './solicitudesEstado-page.component.html',
  styleUrls: ['./solicitudesEstado-page.component.css'],
})
export class SolicitudesEstadoPageComponent {
  private cenadStore = inject(CenadStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private iconoStore = inject(IconosStore);
  estado = input<string>();
  solicitudes = computed(() => {
    switch (this.estado()) {
      case 'Borrador':
        return this.cenadStore.solicitudesBorrador();
      case 'Solicitada':
        return this.cenadStore.solicitudesSolicitada();
      case 'Rechazada':
        return this.cenadStore.solicitudesRechazada();
      case 'Validada':
        return this.cenadStore.solicitudesValidada();
      case 'Cancelada':
        return this.cenadStore.solicitudesCancelada();
      default:
        return this.cenadStore.solicitudesBorrador();
    }
  });

  faConsultar = this.iconoStore.faConsultar;
  mostrarModal = signal(false);
  estadoTitulo = computed(() => {
    switch (this.estado()) {
      case 'Borrador':
        return 'BORRADORES'
      case 'Solicitada':
        return 'SOLICITADAS'
      case 'Rechazada':
        return 'RECHAZADAS'
      case 'Validada':
        return 'VALIDADAS'
      case 'Cancelada':
        return 'CANCELADAS'
      default:
        return 'BORRADORES'
    }
  })
  claseEstado = computed(() => {
    switch (this.estado()) {
      case 'Borrador':
        return 'borradores'
      case 'Solicitada':
        return 'solicitadas'
      case 'Rechazada':
        return 'rechazadas'
      case 'Validada':
        return 'validadas'
      case 'Cancelada':
        return 'canceladas'
      default:
        return 'borradores'
    }
  })
  solicitudesFiltradasPorUnidad = computed(() => {
    if (!this.usuarioLogueadoStore.unidad()?.nombre) return this.solicitudes()
    return this.solicitudes().filter(s => s.unidadUsuaria == this.usuarioLogueadoStore.unidad()?.nombre)
  })
  // Ordenar por fechaInicio DESC
  solicitudesOrdenadas = computed(() => {
    return [...this.solicitudesFiltradasPorUnidad()].sort((a: Solicitud, b: Solicitud) => new Date(b.fechaHoraInicioRecurso!).getTime() - new Date(a.fechaHoraInicioRecurso!).getTime());
  });
  // Solo las 5 más recientes
  solicitudesTop5 = computed(() => this.solicitudesOrdenadas().slice(0, 5));

  // Funciones para modal
  abrirModal = () => {
    this.mostrarModal.set(true);
  }

  cerrarModal = () => {
    this.mostrarModal.set(false);
  }
}
