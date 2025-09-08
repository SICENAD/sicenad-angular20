import { Component, computed, inject, input } from '@angular/core';
import { IconosStore } from '@stores/iconos.store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CenadStore } from '@stores/cenad.store';
import { OrquestadorService } from '@services/orquestadorService';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { NormativaModalComponent } from '../normativaModal/normativaModal.component';
import { Normativa } from '@interfaces/models/normativa';

@Component({
  selector: 'app-normativa',
  imports: [NormativaModalComponent, FontAwesomeModule],
  templateUrl: './normativa.component.html',
  styleUrls: ['./normativa.component.css']
})
export class NormativaComponent {

  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore); private iconoStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);

  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.cenadVisitado()?.idString === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
  });
  faDownload = this.iconoStore.faDownload;

  normativa = input.required<Normativa>();

  descargar(): void {
    const archivo = this.normativa().nombreArchivo;
    if (!archivo) {
      console.warn('No hay archivo para descargar');
      return;
    }
    this.orquestadorService.getArchivoNormativa(archivo, this.idCenad()).subscribe({
      next: () => {
        console.log(`Archivo ${archivo} descargado correctamente`);
      },
      error: (err) => {
        console.error('Error descargando el archivo', err);
      }
    });
  }
}
