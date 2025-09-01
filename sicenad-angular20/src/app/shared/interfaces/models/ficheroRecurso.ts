import { Fichero } from "./fichero";
import { Recurso } from "./recurso";

export interface FicheroRecurso extends Fichero {
  recurso?: Recurso;
}
