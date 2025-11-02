import { UsuarioNormal } from "./usuarioNormal";

export interface Unidad {
  Id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  tfno: string;
  email: string;
  poc: string;
  usuariosNormal?: UsuarioNormal[];
  url?: string;
}
