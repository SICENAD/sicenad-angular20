import { Fichero } from "./fichero";

export interface Cartografia extends Fichero {
  escala: string;
  sistemaReferencia: string;
  fechaCartografia?: Date;
}
