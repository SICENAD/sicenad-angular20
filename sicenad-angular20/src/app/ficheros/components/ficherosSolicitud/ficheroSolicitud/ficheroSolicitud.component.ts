import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';
import { FicheroSolicitud } from '@interfaces/models/ficheroSolicitud';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { FicheroSolicitudModalComponent } from '../ficheroSolicitudModal/ficheroSolicitudModal.component';
import { Solicitud } from '@interfaces/models/solicitud';

@Component({
  selector: 'app-ficheroSolicitud',
  imports: [FontAwesomeModule, FicheroSolicitudModalComponent],
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
  solicitud = input.required<Solicitud>();
  idSolicitud = input.required<string>();
  isCenad = input<boolean>();
  output = output<void>();
  categoriaFichero = signal<CategoriaFichero | null>(null);
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());

  today = new Date();

  isFechaPosteriorAHoy(): boolean {
    const fechaStr = this.solicitud()?.fechaFinDocumentacion;
    if (!fechaStr) return true;
    const fecha = new Date(fechaStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    return fecha.getTime() >= today.getTime();
  }

  descargar(): void {
    const archivo = this.ficheroSignal()?.nombreArchivo;
    if (!archivo) {
      return;
    }
    this.orquestadorService.getArchivoSolicitud(archivo, this.idCenad(), this.idSolicitud()).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error(err);
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

