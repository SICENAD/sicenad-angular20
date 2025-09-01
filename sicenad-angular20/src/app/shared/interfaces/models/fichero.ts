import { CategoriaFichero } from "./categoriaFichero";
import { Cenad } from "./cenad";

export interface Fichero {
  idString: string;
  nombre: string;
  nombreArchivo: string;
  descripcion: string;
  cenad?: Cenad;
  categoriaFichero?: CategoriaFichero;
  url?: string;
}
