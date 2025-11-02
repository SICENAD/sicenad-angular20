import { CategoriaFichero } from "./categoriaFichero";
import { Cenad } from "./cenad";

export interface Fichero {
  Id: string;
  nombre: string;
  nombreArchivo: string;
  descripcion: string;
  cenad?: Cenad;
  categoriaFichero?: CategoriaFichero;
  url?: string;
  urlImagen?: string;
  urlDescarga?: string;
}
