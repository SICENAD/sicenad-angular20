import { Component, computed, inject, input } from '@angular/core';
import { CartografiaModalComponent } from '../cartografiaModal/cartografiaModal.component';
import { Cartografia } from '@interfaces/models/cartografia';
import { IconosStore } from '@stores/iconos.store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CenadStore } from '@stores/cenad.store';
import { OrquestadorService } from '@services/orquestadorService';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { IdiomaService } from '@services/idiomaService';

@Component({
  selector: 'app-cartografia',
  imports: [CartografiaModalComponent, FontAwesomeModule],
  templateUrl: './cartografia.component.html',
  styleUrls: ['./cartografia.component.css']
})
export class CartografiaComponent {

  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore); private iconoStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
  private idiomaService = inject(IdiomaService);

  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.cenadVisitado()?.idString === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
  });
  faDownload = this.iconoStore.faDownload;

  cartografia = input.required<Cartografia>();

  descargar(): void {
    const archivo = this.cartografia().nombreArchivo;
    if (!archivo) {
      this.idiomaService.tVars('archivos.noArchivo').then(mensaje => {
        console.warn(mensaje);
      });
      return;
    }
    this.orquestadorService.getArchivoCartografia(archivo, this.idCenad()).subscribe({
      next: () => {
        this.idiomaService.tVars('archivos.exitoDescarga').then(mensaje => {
          console.log(mensaje);
        });
      },
      error: (err) => {
        this.idiomaService.tVars('archivos.errorDescarga').then(mensaje => {
          console.error(mensaje);
        });
      }
    });
  }
}
