import { inject, Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { ToastrService } from "ngx-toastr";

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
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}T${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`; // YYYY-MM-DDTHH:mm
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
}
