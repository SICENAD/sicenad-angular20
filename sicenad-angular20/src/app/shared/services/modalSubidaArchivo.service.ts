import { ApplicationRef, ComponentRef, createComponent, inject, Injectable, Injector, EnvironmentInjector } from '@angular/core';
import { ModalState } from '@interfaces/others/modalState';
import { ModalSubidaArchivoComponent } from '@shared/components/modalSubidaArchivo/modalSubidaArchivo.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalSubidaService {
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);
  private componentRef: ComponentRef<ModalSubidaArchivoComponent> | null = null;
  private state = new Map<string, ModalState>();
  private state$ = new BehaviorSubject<ModalState[] | null>(null);

  // Observable que el componente consumirá
  asObservable() {
    return this.state$.asObservable();
  }

  // Obtener estado actual para una clave (útil para mensajes de error)
  getState(key: string): ModalState | undefined {
    return this.state.get(key);
  }

  private ensureComponent() {
    if (this.componentRef) return;
    try {
      this.componentRef = createComponent(ModalSubidaArchivoComponent as any, {
        environmentInjector: this.envInjector,
        elementInjector: this.injector,
      });
      this.appRef.attachView(this.componentRef.hostView);
      const el = (this.componentRef.location && (this.componentRef.location.nativeElement as HTMLElement)) || null;
      if (el) document.body.appendChild(el);
    } catch (e) {
      console.error('No se pudo crear ModalSubidaArchivo component dinámicamente:', e);
      this.componentRef = null;
    }
  }

  open(key: string, title: string) {
    try {
      this.ensureComponent();
      const s: ModalState = { key, title, percent: 0, status: 'active' };
      this.state.set(key, s);
      this.emit();
      return true;
    } catch (e) {
      return false;
    }
  }

  update(key: string, percent: number, message?: string) {
    const s = this.state.get(key);
    if (!s) return;
    s.percent = percent;
    if (message) s.message = message;
    this.state.set(key, s);
    this.emit();
  }

  complete(key: string, finalMessage?: string) {
    const s = this.state.get(key);
    if (!s) return;
    s.percent = 100;
    s.status = 'complete';
    if (finalMessage) s.message = finalMessage;
    this.state.set(key, s);
    this.emit();
    // auto close shortly
    setTimeout(() => this.close(key), 800);
  }

  error(key: string, errorMessage?: string) {
    const s = this.state.get(key) || ({ key, title: '', percent: 0, status: 'error' } as ModalState);
    s.status = 'error';
    if (errorMessage) s.message = errorMessage;
    this.state.set(key, s);
    this.emit();
  }

  close(key: string) {
    this.state.delete(key);
    this.emit();
    // detach component if no modals left
    if (this.state.size === 0 && this.componentRef) {
      try {
        this.appRef.detachView(this.componentRef.hostView);
        this.componentRef.destroy();
      } catch (e) {}
      this.componentRef = null;
    }
  }

  private emit() {
    const arr = Array.from(this.state.values());
    this.state$.next(arr.length ? arr : null);
  }
}
