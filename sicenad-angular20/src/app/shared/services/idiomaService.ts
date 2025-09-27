import { Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private translate = inject(TranslateService);

  // Signal para almacenar idioma actual
  idioma = signal<string>('es');

  idiomaActual() {
    return this.idioma();
  }

  constructor() {
    this.init();
    // Reacción automática a cambios de idioma
    effect(() => {
      this.translate.use(this.idioma());
    });
  }

  init() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setFallbackLang('es');
    const idiomaNavegador = this.translate.getBrowserLang();
    const idiomasDisponibles = this.translate.getLangs();     // idiomas conocidos por ngx-translate
    // Si el idioma del navegador está en la lista, úsalo; si no, fallback
    const idioma = idiomasDisponibles.includes(idiomaNavegador || '') ? idiomaNavegador! : 'es';
    this.idioma.set(idioma);
  }

  cambiarIdioma(idioma: string) {
    this.idioma.set(idioma);
  }

  // Método para traducir dentro del TS
  t(texto: string): string {
    return this.translate.instant(texto);
  }

  // Método que añade idiomas al TranslateService dinámicamente
  addIdiomas(codigos: string[]) {
    this.translate.addLangs(codigos);
  }
}
