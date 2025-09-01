import { Cartografia } from "./cartografia";
import { Fichero } from "./fichero";

export interface CategoriaFichero {
  idString: string;
  nombre: string;
  descripcion: string;
  tipo: number;
  ficheros?: Fichero[];
  cartografias?: Cartografia[];
  url?: string;
}
