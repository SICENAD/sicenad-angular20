import { Cenad } from "./cenad";
import { Usuario } from "./usuario";

export interface UsuarioAdministrador extends Usuario {
  cenad?: Cenad;

}
