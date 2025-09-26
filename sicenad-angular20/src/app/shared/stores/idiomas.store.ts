import { Injectable, computed, inject, effect } from '@angular/core';
import { Idioma } from '@interfaces/others/idioma';
import { TranslationService } from '@services/translationService';
import { UtilService } from '@services/utilService';
import { UtilsStore } from './utils.store';

@Injectable({ providedIn: 'root' })
export class IdiomasStore {
  private utils = inject(UtilsStore);
  private translation = inject(TranslationService);
  private utilService = inject(UtilService);

  // Idiomas disponibles: directamente desde el store de properties
  idiomasDisponibles = computed<Idioma[]>(() => {
    const idiomas = this.utils.idiomasDisponibles();
    if (!idiomas) return [];
    return idiomas.map((i: Idioma) => ({
      ...i,
      bandera: `${this.utilService.baseNormalizada()}${i.bandera}` // combinamos ruta base
    }));
  });

  // Idioma actual (signal que delega en TranslationService)
  idiomaActual = computed(() => this.translation.idioma());

   constructor() {
    // Cada vez que idiomasDisponibles cambie, sincronizamos con TranslationService
    effect(() => {
      const codigos = this.idiomasDisponibles().map(i => i.codigo);
      this.translation.addIdiomas(codigos);
    });
  }

  // Cambiar idioma
  cambiarIdioma(idioma: string) {
    this.translation.cambiarIdioma(idioma);
  }

  // Métodos
  getBandera(codigo: string) {
    const found = this.idiomasDisponibles().find(i => i.codigo === codigo);
    return found?.bandera || `${this.utilService.baseNormalizada()}img/banderas/default.svg`;
  }

  getEtiqueta(codigo: string) {
    const found = this.idiomasDisponibles().find(i => i.codigo === codigo);
    return found?.etiqueta || codigo;
  }
  mostrarAlert() {
    alert(this.translation.t('comun.ALERT_MSG'));
  }
}
