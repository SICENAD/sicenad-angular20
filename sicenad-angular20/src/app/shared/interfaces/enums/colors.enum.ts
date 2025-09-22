export type Estado = 'Borrador' | 'Solicitada' | 'Validada' | 'Rechazada' | 'Cancelada' | 'Planificación' | 'Mantenimiento';

export const EVENT_COLORS: Record<Estado, { primary: string; secondary: string }> = {
    Borrador: { primary: '#6c757d', secondary: '#e2e3e5' },      // Gris
    Solicitada: { primary: '#FFC0CB', secondary: '#fff3cd' },    // Rosa
    Validada: { primary: '#28a745', secondary: '#d4edda' },      // Verde
    Cancelada: { primary: '#dc3545', secondary: '#f8d7da' },     // Rojo
    Rechazada: { primary: '#343a40', secondary: '#e9ecef' },     // Oscuro
    Planificación: { primary: '#17a2b8', secondary: '#d1ecf1' },// Azul verdoso
    Mantenimiento: { primary: '#fd7e14', secondary: '#ffe5d0' }  // Naranja
};
