import { UsuarioNormal } from "./usuarioNormal";

export interface Unidad {
  idString: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  tfno: string;
  email: string;
  poc: string;
  usuariosNormal?: UsuarioNormal[];
  url?: string;
}
