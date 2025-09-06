import { Component, input } from '@angular/core';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { Usuario } from '@interfaces/models/usuario';
import { UsuarioModalComponent } from '../usuarioModal/usuarioModal.component';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { UsuarioNormal } from '@interfaces/models/usuarioNormal';

@Component({
  selector: 'app-usuario',
  imports: [UsuarioModalComponent],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent {

  usuario = input.required<Usuario>();
  get usuarioTipado(): UsuarioSuperAdministrador | UsuarioAdministrador | UsuarioGestor | UsuarioNormal {
    switch (this.usuario()?.rol) {
      case RolUsuario.Superadministrador:
        return this.usuario() as UsuarioSuperAdministrador;
      case RolUsuario.Administrador:
        return this.usuario() as UsuarioAdministrador;
      case RolUsuario.Gestor:
        return this.usuario() as UsuarioGestor;
      case RolUsuario.Normal:
      default:
        return this.usuario() as UsuarioNormal;
    }
  }
 }
