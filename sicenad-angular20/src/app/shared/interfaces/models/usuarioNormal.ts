import { Unidad } from "./unidad";
import { Usuario } from "./usuario";

export interface UsuarioNormal extends Usuario {
  unidad?: Unidad;

}
