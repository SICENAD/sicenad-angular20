import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { format } from 'date-fns/format';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  /**
   * Primera línea: nombre completo del día (ej: "Lunes")
   */
  override weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEEE', locale ?? 'es'); // Lunes, Martes...
  }
  /**
   * Segunda línea: fecha en formato "22 sept"
   */
  override weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'd MMM', locale ?? 'es'); // 22 sept
  }

  // Hora de la columna en week/day view
  public override dayViewHour({ date }: DateFormatterParams): string {
    return format(date, 'HH:mm'); // formato 24h
  }

  public override weekViewHour({ date }: DateFormatterParams): string {
    return format(date, 'HH:mm'); // formato 24h
  }
}
