import { Cenad } from "./cenad";
import { FicheroSolicitud } from "./ficheroSolicitud";
import { Recurso } from "./recurso";
import { UsuarioNormal } from "./usuarioNormal";

export interface Solicitud {
  idString: string;
  observaciones: string;
  observacionesCenad: string;
  jefeUnidadUsuaria: string;
  pocEjercicio: string;
  tlfnRedactor: string;
  unidadUsuaria: string;
  estado: string;
  fechaSolicitud?: Date | string;
  fechaUltModSolicitud?: Date | string;
  fechaHoraInicioRecurso?: Date | string;
  fechaHoraFinRecurso?: Date | string;
  fechaFinDocumentacion?: Date | string;
  cenad?: Cenad;
  usuarioNormal?: UsuarioNormal;
  documentacionCenad?: FicheroSolicitud[];
  documentacionUnidad?: FicheroSolicitud[];
  recurso?: Recurso;
  etiqueta: string;
  url?: string;
}
