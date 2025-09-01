import { Cenad } from "./cenad";
import { Usuario } from "./usuario";

export interface UsuarioGestor extends Usuario {
  cenad?: Cenad;
}
