import { Recurso } from "./recurso";

export interface TipoFormulario {
  Id: string;
  nombre: string;
  descripcion: string;
  recursos?: Recurso[];
  url?: string;
}
