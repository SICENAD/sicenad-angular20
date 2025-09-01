import { Cartografia } from "./cartografia";
import { Categoria } from "./categoria";
import { Normativa } from "./normativa";
import { Recurso } from "./recurso";
import { UsuarioAdministrador } from "./usuarioAdministrador";
import { UsuarioGestor } from "./usuarioGestor";

export interface Cenad {
  idString: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  tfno: string;
  email: string;
  escudo: string;
  infoCenad: string;
  provincia: number;
  categorias?: Categoria[];
  cartografias?: Cartografia[];
  normativas?: Normativa[];
  recursos?: Recurso[];
  usuariosGestores?: UsuarioGestor[];
  usuarioAdministrador?: UsuarioAdministrador;
  url?: string;
}
