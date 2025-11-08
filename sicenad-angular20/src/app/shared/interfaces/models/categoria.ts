import { Cenad } from "./cenad";
import { Recurso } from "./recurso";

export interface Categoria {
  Id: string;
  nombre: string;
  descripcion: string;
  cenad?: Cenad;
  categoriaPadre?: Categoria;
  subcategorias?: Categoria[];
  recursos?: Recurso[];
  url?: string;
}
