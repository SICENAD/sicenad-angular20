import { Cartografia } from "./cartografia";
import { Fichero } from "./fichero";

export interface CategoriaFichero {
  Id: string;
  nombre: string;
  descripcion: string;
  tipo_categoriaFichero: number;
  ficheros?: Fichero[];
  cartografias?: Cartografia[];
  url?: string;
}
