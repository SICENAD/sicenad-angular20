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
    formatearFechaHora(fechaISO: string | Date): string {
      const fecha = new Date(fechaISO);
      const dia = String(fecha.getUTCDate()).padStart(2, '0');
      const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
      const year = fecha.getUTCFullYear();
      const horas = String(fecha.getUTCHours()).padStart(2, '0');
      const minutos = String(fecha.getUTCMinutes()).padStart(2, '0');
      const segundos = String(fecha.getUTCSeconds()).padStart(2, '0');
      return `${dia}-${mes}-${year} ${horas}:${minutos}:${segundos}`;
    }

    formatearFecha(fechaSQL: any | null | undefined): string {
      if (!fechaSQL) return '';
      const [fecha] = fechaSQL.split(' ');
      const [anio, mes, dia] = fecha.split('-');
      return `${dia}-${mes}-${anio}`;
    }

    toDate(fechaISO: string | Date): string {
      return new Date(fechaISO).toISOString().split('T')[0];
    }

    toInstant(fechaString: string): string {
      return new Date(fechaString).toISOString();
    }

    parseDate(dateString: string | null | undefined): Date | null {
      if (!dateString) return null;

      const match = dateString.match(
        /^(\d{2})-(\d{2})-(\d{4})(?: (\d{2}):(\d{2})(?::(\d{2}))?)?$/
      );
      if (match) {
        const [, day, month, year, hour = '00', minute = '00', second = '00'] = match;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      }

      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return new Date(dateString.replace(' ', 'T'));
      }

      return null;
    }

    formatDate(dateString: string | null | undefined): string {
      const date = this.parseDate(dateString);
      if (!date || isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 10);
    }

    formatDateTime(dateString: string | null | undefined): string {
      const date = this.parseDate(dateString);
      if (!date || isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    }

    // ----------------- PATH PUBLIC -----------------
    baseNormalizada(): string {
      const base = environment.publicPath || '/';
      return base.endsWith('/') ? base : base + '/';
    }
}
