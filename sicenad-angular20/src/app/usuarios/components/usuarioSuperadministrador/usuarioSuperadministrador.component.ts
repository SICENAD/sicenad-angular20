import { Component, input } from '@angular/core';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { UsuarioSuperadministradorModalComponent } from '../usuarioSuperadministradorModal/usuarioSuperadministradorModal.component';

@Component({
  selector: 'app-usuarioSuperadministrador',
  imports: [UsuarioSuperadministradorModalComponent],
  templateUrl: './usuarioSuperadministrador.component.html',
  styleUrls: ['./usuarioSuperadministrador.component.css']
})
export class UsuarioSuperadministradorComponent {

  usuarioSuperadministrador = input.required<UsuarioSuperAdministrador>();
 }
