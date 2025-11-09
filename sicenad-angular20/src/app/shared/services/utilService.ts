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
    if (res.d?.results && Array.isArray(res.d.results)) return res.d.results as T[];
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
    if (Array.isArray(res)) return (res[0] as T) ?? null;
    if (typeof res === 'object') return res as T;
    return null;
  }
}
