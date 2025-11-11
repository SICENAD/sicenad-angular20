import { Categoria } from "./categoria";
import { Cenad } from "./cenad";
import { FicheroRecurso } from "./ficheroRecurso";
import { Solicitud } from "./solicitud";
import { TipoFormulario } from "./tipoFormulario";
import { UsuarioGestor } from "./usuarioGestor";

export interface Recurso {
  Id: string;
  nombre: string;
  descripcion: string;
  otros: string;
  conDatosEspecificosSolicitud: boolean;
  datosEspecificosSolicitud: string;
  cenad?: Cenad;
  cenadNombre?: string;
  categoria?: Categoria;
  usuarioGestor?: UsuarioGestor;
  tipoFormulario?: TipoFormulario;
  ficheros?: FicheroRecurso[];
  solicitudes?: Solicitud[];
  url?: string;
}
