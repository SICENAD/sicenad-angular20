import { Recurso } from "./recurso";

export interface TipoFormulario {
  idString: string;
  nombre: string;
  descripcion: string;
  recursos?: Recurso[];
  url?: string;
}
