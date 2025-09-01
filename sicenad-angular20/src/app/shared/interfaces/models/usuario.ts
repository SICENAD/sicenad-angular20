export interface Usuario {
  idString: string;
  rol: string;
  username: string;
  descripcion: string;
  tfno: string;
  email: string;
  emailAdmitido: boolean;
  url?: string;
}
