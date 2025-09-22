import { formatDate } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { UtilService } from '@services/utilService';
import { CalendarPreviousViewDirective, CalendarTodayDirective, CalendarNextViewDirective, CalendarView } from 'angular-calendar';

@Component({
    selector: 'app-calendarHeader',
    imports: [
        CalendarPreviousViewDirective,
        CalendarTodayDirective,
        CalendarNextViewDirective
    ],
    templateUrl: './calendarHeader.component.html',
    styleUrls: ['./calendarHeader.component.css'],
})
export class CalendarHeaderComponent {
    private utilService = inject(UtilService);
    /** Inputs */
    view = input.required<CalendarView>();
    viewDate = input.required<Date>();
    locale = input<string>('es');

    /** Outputs */
    viewChange = output<CalendarView>();
    viewDateChange = output<Date>();

    CalendarView = CalendarView;

    /**
     * Handler que recibe la nueva fecha desde las directivas (previous/today/next)
     * - Emitimos el evento de salida para que el padre actualice su valor.
     * - Si la signal `viewDate` es "writable" en este contexto, podrías actualizarla
     *   aquí también (opcional). Normalmente el padre es quien actualiza la input.
     */
    onViewDateChange(newDate: Date) {
        // Emitimos el cambio para el padre
        this.viewDateChange.emit(newDate);
        // Opcional: si la signal es escribible y quieres actualizar localmente:
        // if ((this.viewDate as any)?.set) { (this.viewDate as any).set(newDate); }
    }

    // Formatea la fecha según la vista
    getFormattedTitle(view: CalendarView, viewDate: Date, locale: string = 'es'): string {
        const month = this.utilService.toTitleCase(formatDate(viewDate, 'LLLL', locale));
        const year = formatDate(viewDate, 'yyyy', locale);
        switch (view) {
            case CalendarView.Month:
                // Ejemplo: "Septiembre 2025"
                return `${month} ${year}`;
            case CalendarView.Week: {
                // Ejemplo: "22 de septiembre - 28 de septiembre, 2025"
                const startOfWeek = new Date(viewDate);
                const endOfWeek = new Date(viewDate);
                // Lunes como inicio de semana
                const day = startOfWeek.getDay(); // 0=Domingo, 1=Lunes
                const diff = day === 0 ? -6 : 1 - day;
                startOfWeek.setDate(viewDate.getDate() + diff);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                const startDay = formatDate(startOfWeek, 'd', locale); // 22
                const endDay = formatDate(endOfWeek, 'd', locale);     // 28
                const startMonth = this.utilService.toTitleCase(formatDate(startOfWeek, 'LLLL', locale)); // SEPTIEMBRE
                const endMonth = this.utilService.toTitleCase(formatDate(endOfWeek, 'LLLL', locale)); // SEPTIEMBRE
                return `${startDay} de ${startMonth} - ${endDay} de ${endMonth}, ${year}`;
            }
            case CalendarView.Day: {
                // Ejemplo: "Lunes 22 de septiembre de 2025"
                const weekday = this.utilService.toTitleCase(formatDate(viewDate, 'EEEE', locale)); // Lunes
                const day = formatDate(viewDate, 'd', locale); // 22
                return `${weekday} ${day} de ${month} de ${year}`;
            }
            default:
                return '';
        }
    }
}
