import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { FicheroSolicitud } from '@interfaces/models/ficheroSolicitud';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-ficheroSolicitud',
  imports: [FontAwesomeModule],
  templateUrl: './ficheroSolicitud.component.html',
  styleUrls: ['./ficheroSolicitud.component.css'],
})
export class FicheroSolicitudComponent {
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  faDownload = this.iconoStore.faDownload;

  fichero = input.required<FicheroSolicitud>();
  ficheroSignal = signal<FicheroSolicitud | undefined>(undefined);
  idSolicitud = input.required<string>();
  output = output<void>();
  categoriaFichero = signal<CategoriaFichero | null>(null);
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());

  descargar(): void {
    const archivo = this.ficheroSignal()?.nombreArchivo;
    if (!archivo) {
      console.warn('No hay archivo para descargar');
      return;
    }
    this.orquestadorService.getArchivoSolicitud(archivo, this.idCenad(), this.idSolicitud()).subscribe({
      next: () => {
        console.log(`Archivo ${archivo} descargado correctamente`);
      },
      error: (err) => {
        console.error('Error descargando el archivo', err);
      }
    });
  }

  constructor() {
    // Sincronizar el input con la señal interna
    effect(() => {
      const nuevoFichero = this.fichero();
      this.ficheroSignal.set(nuevoFichero);
    });
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const ficheroActual = this.ficheroSignal();
      const categoriasFichero = this.categoriasFichero();
      if (!categoriasFichero || !ficheroActual) return;
      // Cargar la categoría de fichero del fichero
      this.orquestadorService.loadCategoriaFicheroDeFichero(ficheroActual.idString).subscribe({
        next: (categoriaFichero) => {
          const categoriaFicheroRef = categoriaFichero
            ? categoriasFichero.find(c => c.idString === categoriaFichero.idString) || null
            : null;
          this.categoriaFichero.set(categoriaFicheroRef);
        }
      });
    });
  }

  recargarFichero() {
    this.orquestadorService.loadFicheroSolicitudSeleccionado(this.ficheroSignal()!.idString).subscribe({
      next: (ficheroActualizado) => {
        this.ficheroSignal.set(ficheroActualizado ?? undefined);
      },
      error: () => {
        this.ficheroSignal.set(undefined);
      }
    });
  }
}

