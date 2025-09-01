import { Fichero } from "./fichero";
import { Solicitud } from "./solicitud";

export interface FicheroSolicitud extends Fichero {
  solicitudRecursoCenad?: Solicitud;
  solicitudRecursoUnidad?: Solicitud;
}
