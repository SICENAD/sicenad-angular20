import { Cenad } from "./cenad";
import { Recurso } from "./recurso";

export interface Categoria {
  idString: string;
  nombre: string;
  descripcion: string;
  escudo: string;
  infoCenad?: string;
  provincia: number;
  cenad?: Cenad;
  categoriaPadre?: Categoria;
  subcategorias?: Categoria[];
  recursos?: Recurso[];
  url?: string;
}
