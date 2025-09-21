export type TipoEvento = 'reunion' | 'cumpleaños' | 'tarea' | 'otro';

export const EVENT_COLORS: Record<TipoEvento, { primary: string; secondary: string }> = {
  reunion: { primary: '#1e90ff', secondary: '#D1E8FF' },
  cumpleaños: { primary: '#f39c12', secondary: '#ffe5b4' },
  tarea: { primary: '#28a745', secondary: '#c3f0c1' },
  otro: { primary: '#6c757d', secondary: '#d6d8db' }
};

