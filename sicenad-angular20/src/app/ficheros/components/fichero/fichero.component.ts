import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FicheroModalComponent } from '../ficheroModal/ficheroModal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';

@Component({
  selector: 'app-fichero',
  imports: [FicheroModalComponent, FontAwesomeModule],
  templateUrl: './fichero.component.html',
  styleUrls: ['./fichero.component.css'],
})
export class FicheroComponent {
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  faDownload = this.iconoStore.faDownload;

  fichero = input.required<FicheroRecurso>();
  idRecurso = input.required<string>();
  output = output<void>();
  categoriaFichero = signal<CategoriaFichero | null>(null);
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());

  descargar(): void {
    const archivo = this.fichero().nombreArchivo;
    if (!archivo) {
      console.warn('No hay archivo para descargar');
      return;
    }
    this.orquestadorService.getArchivoRecurso(archivo, this.idCenad(), this.idRecurso()).subscribe({
      next: () => {
        console.log(`Archivo ${archivo} descargado correctamente`);
      },
      error: (err) => {
        console.error('Error descargando el archivo', err);
      }
    });
  }

  constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const ficheroActual = this.fichero();
      const categoriasFichero = this.categoriasFichero();
      if (!categoriasFichero || !ficheroActual) return;
      // Cargar la categoría de fichero del fichero
      this.orquestadorService.loadCategoriaFicheroDeFichero(ficheroActual.idString).subscribe({
        next: (categoriaFichero) => {
          const categoriaFicheroRef = categoriaFichero
            ? categoriasFichero.find(c => c.idString === categoriaFichero.idString) || null
            : null;
            this.categoriaFichero.set(categoriaFichero);
        }
      });
    });
  }
}
