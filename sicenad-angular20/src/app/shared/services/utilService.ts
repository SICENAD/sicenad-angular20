import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UtilService {
  private toastr = inject(ToastrService);

  // ----------------- TOAST -----------------
  toast(str: string, tipo: string) {
    switch (tipo) {
      case 'warning':
        this.toastr.warning(str);
        break;
      case 'error':
        this.toastr.error(str);
        break;
      case 'info':
        this.toastr.info(str);
        break;
      case 'success':
      default:
        this.toastr.success(str);
    }
  }

  // ----------------- BLOQUEO DE UI CON OVERLAY DURANTE SUBIDAS -----------------
  /**
   * Muestra un overlay bloqueante con progreso. No permite interacción con la app.
   */
  blockingProgressStart(key: string, message: string) {
    try {
      if (typeof document === 'undefined') return;
      const existing = document.getElementById(`sicenad-blocking-${key}`);
      if (existing) return; // ya existe
      const overlay = document.createElement('div');
      overlay.id = `sicenad-blocking-${key}`;
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.zIndex = '20000';
      overlay.style.background = 'rgba(0,0,0,0.45)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      const box = document.createElement('div');
      box.style.background = '#fff';
      box.style.padding = '20px 24px';
      box.style.borderRadius = '8px';
      box.style.minWidth = '320px';
      box.style.maxWidth = '90%';
      box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      box.style.textAlign = 'center';
      const title = document.createElement('div');
      title.style.marginBottom = '12px';
      title.style.fontSize = '16px';
      title.style.fontWeight = '600';
      title.innerText = message; // debe venir sin porcentaje: "Subiendo nombreArchivo"
      const progressBarOuter = document.createElement('div');
      progressBarOuter.style.width = '100%';
      progressBarOuter.style.height = '12px';
      progressBarOuter.style.background = '#eee';
      progressBarOuter.style.borderRadius = '6px';
      progressBarOuter.style.overflow = 'hidden';
      const progressBarInner = document.createElement('div');
      progressBarInner.style.height = '100%';
      progressBarInner.style.width = '0%';
      progressBarInner.style.background = '#1976d2';
      progressBarInner.style.transition = 'width 300ms ease';
      progressBarOuter.appendChild(progressBarInner);
      const percentLabel = document.createElement('div');
      percentLabel.style.marginTop = '10px';
      percentLabel.style.fontSize = '14px';
      percentLabel.style.fontWeight = '600';
      percentLabel.innerText = '0%';
      box.appendChild(title);
      box.appendChild(progressBarOuter);
      box.appendChild(percentLabel);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      // store references on element dataset for updates
      (overlay as any).__sicenad = { progressBarInner, percentLabel, title, box };
    } catch (e) {
      console.error('Error creating blocking overlay', e);
    }
  }

  blockingProgressUpdate(key: string, messageOrPercent: string) {
    try {
      if (typeof document === 'undefined') return;
      const overlay = document.getElementById(`sicenad-blocking-${key}`) as any;
      if (!overlay || !overlay.__sicenad) return;
      const { progressBarInner, percentLabel, title } = overlay.__sicenad;
      // messageOrPercent puede contener texto y/o porcentaje. Extraemos porcentaje y actualizamos barra/etiqueta
      const m = (messageOrPercent || '').toString().match(/(\d{1,3})%/);
      if (m && m[1]) {
        const p = Math.min(100, Math.max(0, parseInt(m[1], 10)));
        progressBarInner.style.width = p + '%';
        percentLabel.innerText = `${p}%`;
      }
      // Si hay texto sin porcentaje, usarlo como título (sin el %)
      const messageOnly = (messageOrPercent || '').toString().replace(/(\d{1,3}%)/, '').trim();
      if (messageOnly) {
        try { title.innerText = messageOnly; } catch (e) {}
      }
    } catch (e) {
      console.error('Error updating blocking overlay', e);
    }
  }

  blockingProgressComplete(key: string, finalMessage?: string) {
    try {
      if (typeof document === 'undefined') return;
      const overlay = document.getElementById(`sicenad-blocking-${key}`) as any;
      if (!overlay) return;
      const { progressBarInner, percentLabel, title } = overlay.__sicenad || {};
      if (progressBarInner) progressBarInner.style.width = '100%';
      if (percentLabel) percentLabel.innerText = '100%';
      // opcional: si hay mensaje final, usarlo brevemente en el título
      if (title && finalMessage) title.innerText = finalMessage;
      // auto-dismiss after short delay
      setTimeout(() => {
        try { overlay.remove(); } catch (e) {}
      }, 800);
    } catch (e) {
      console.error('Error completing blocking overlay', e);
    }
  }

  blockingProgressError(key: string, errorMessage: string) {
    try {
      if (typeof document === 'undefined') return;
      const overlay = document.getElementById(`sicenad-blocking-${key}`) as any;
      if (!overlay) return;
      const { title, box } = overlay.__sicenad || {};
      // Mostrar encabezado de error
      if (title) title.innerText = errorMessage || 'Error al subir';
      // Añadir botón Cerrar si no existe
      const btnId = `sicenad-blocking-close-${key}`;
      if (!document.getElementById(btnId) && box) {
        const btn = document.createElement('button');
        btn.id = btnId;
        btn.innerText = 'Cerrar';
        btn.style.display = 'inline-block';
        btn.style.marginTop = '12px';
        btn.style.padding = '8px 12px';
        btn.style.border = 'none';
        btn.style.background = '#1976d2';
        btn.style.color = '#fff';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.setAttribute('aria-label', 'Cerrar diálogo de subida');
        btn.onclick = () => {
          try {
            overlay.remove();
            try { (document.body as HTMLElement).focus(); } catch (e) {}
          } catch (e) {}
        };
        box.appendChild(btn);
        // dar focus al botón para accesibilidad
        setTimeout(() => { try { btn.focus(); } catch (e) {} }, 50);
      }
    } catch (e) {
      console.error('Error showing blocking overlay error', e);
    }
  }

  // ----------------- FORMATEO DE TEXTOS -----------------
  toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toSentenceCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // ----------------- FORMATEO DE FECHAS -----------------
  pad = (n: number) => String(n).padStart(2, '0');

  isoToLocalDate(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`; // YYYY-MM-DD
  }

  isoToLocalDateTime(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}T${this.pad(
      d.getHours()
    )}:${this.pad(d.getMinutes())}`; // YYYY-MM-DDTHH:mm
  }

  fechaDiaMesYear(iso?: string | Date): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${this.pad(d.getDate())}-${this.pad(d.getMonth() + 1)}-${d.getFullYear()}`; // DD-MM-YYYY
  }

  /**
   * Convierte "YYYY-MM-DD" (date input) en UTC ISO completo con "T00:00:00Z"
   */
  localDateToIso(dateString?: string | null): string | null {
    if (!dateString) return null;
    // Interpreta como local a las 00:00
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toISOString(); // => UTC
  }

  /**
   * Convierte "YYYY-MM-DDTHH:mm" (datetime-local input) en UTC ISO completo
   */
  localDateTimeToIso(dateTimeString?: string | Date | null): string | null {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    // construir string manual sin milisegundos
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  }

  // ----------------- PATH PUBLIC -----------------
  baseNormalizada(): string {
    const base = environment.publicPath || '/';
    return base.endsWith('/') ? base : base + '/';
  }

  // ----------------- GENERAR TOKEN ALEATORIO PARA SIMULACIÓN -----------------
  generarTokenAleatorio(longitud: number = 64): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(longitud);
    crypto.getRandomValues(array);
    for (let i = 0; i < longitud; i++) {
      const indice = array[i] % caracteres.length;
      token += caracteres.charAt(indice);
    }
    return token;
  }

  // Normaliza respuesta si getElementos devuelve res bruto
  ensureArray<T>(res: any): T[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as T[];
    // OData verbose: res.d.results
    if (res.d?.results && Array.isArray(res.d.results)) return res.d.results as T[];
    // OData minimal/none: res.value
    if (res.value && Array.isArray(res.value)) return res.value as T[];
    // Si la API devolviera un objeto único (no array), lo convertimos en array de 1 elemento
    return [res] as T[];
  }

  /**
   * Normaliza una respuesta que representa un único elemento y devuelve el objeto o null.
   * Maneja las formas comunes: res.d (objeto), res.d.results[0], array[0], o el propio objeto.
   */
  ensureObject<T>(res: any): T | null {
    if (!res) return null;
    if (res.d) {
      // OData verbose: res.d puede ser el objeto o contener results
      if (Array.isArray(res.d.results)) return (res.d.results[0] as T) ?? null;
      return (res.d as T) ?? null;
    }
    // OData minimal/none: res.value (array) -> tomar primer elemento
    if (res.value && Array.isArray(res.value)) return (res.value[0] as T) ?? null;
    if (Array.isArray(res)) return (res[0] as T) ?? null;
    if (typeof res === 'object') return res as T;
    return null;
  }
}
