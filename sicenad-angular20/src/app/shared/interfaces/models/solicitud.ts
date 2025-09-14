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
  fechaSolicitud?: Date;
  fechaUltModSolicitud?: Date;
  fechaHoraInicioRecurso?: Date;
  fechaHoraFinRecurso?: Date;
  fechaFinDocumentacion?: Date;
  cenad?: Cenad;
  usuarioNormal?: UsuarioNormal;
  documentacionCenad?: FicheroSolicitud[];
  documentacionUnidad?: FicheroSolicitud[];
  recurso?: Recurso;
  etiqueta: string;
  url?: string;
}
