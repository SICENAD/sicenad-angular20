import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CartografiaModalComponent } from '../cartografiaModal/cartografiaModal.component';
import { Cartografia } from '@interfaces/models/cartografia';
import { IconosStore } from '@stores/iconos.store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CenadStore } from '@stores/cenad.store';
import { OrquestadorService } from '@services/orquestadorService';

@Component({
  selector: 'app-cartografia',
  imports: [CartografiaModalComponent, FontAwesomeModule],
  templateUrl: './cartografia.component.html',
  styleUrls: ['./cartografia.component.css']
})
export class CartografiaComponent {

  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);

  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  linkDescarga = signal<string>('');

  faDownload = this.iconoStore.faDownload;

  cartografia = input.required<Cartografia>();

  descargar(): void {
    const archivo = this.cartografia().nombreArchivo;
    if (!archivo) {
      console.warn('No hay archivo para descargar');
      return;
    }
    this.orquestadorService.getArchivoCartografia(archivo, this.idCenad()).subscribe({
      next: () => {
        console.log(`Archivo ${archivo} descargado correctamente`);
      },
      error: (err) => {
        console.error('Error descargando el archivo', err);
      }
    });
  }
}
