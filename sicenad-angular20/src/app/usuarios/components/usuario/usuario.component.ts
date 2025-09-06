import { Component, inject, input, signal } from '@angular/core';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { Usuario } from '@interfaces/models/usuario';
import { UsuarioModalComponent } from '../usuarioModal/usuarioModal.component';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { UsuarioNormal } from '@interfaces/models/usuarioNormal';
import { OrquestadorService } from '@services/orquestadorService';
import { Cenad } from '@interfaces/models/cenad';
import { Unidad } from '@interfaces/models/unidad';

@Component({
  selector: 'app-usuario',
  imports: [UsuarioModalComponent],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent {

  private orquestadorService = inject(OrquestadorService);

  usuario = input.required<Usuario>();
  readonly rolUsuario = RolUsuario;
  cenad = signal<Cenad | undefined>(undefined);
  unidad = signal<Unidad | undefined>(undefined);

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

  private cargarCenadOUnidad(): void {
    if (!this.usuario()) return;
    switch (this.usuario()?.rol) {
      case this.rolUsuario.Superadministrador:
        // Aquí podrás hacer otra llamada o acción específica
        console.log('Usuario Superadministrador detectado');
        break;
      case this.rolUsuario.Administrador:
        this.orquestadorService.loadCenadDeAdministrador(this.usuario().idString).subscribe({
          next: (cenad) => {
            if (cenad) {
              console.log('CENAD cargado para el usuario Administrador:', cenad);
              // Aquí podrías guardar en un signal o propiedad local
              this.cenad.set(cenad);
            } else {
              console.warn(`No se encontró un CENAD para el usuario ${this.usuario().username}`);
            }
          },
          error: (error) => {
            console.error('Error al cargar CENAD para usuario Administrador:', error);
          }
        });
        break;
      case this.rolUsuario.Gestor:
        this.orquestadorService.loadCenadDeGestor(this.usuario().idString).subscribe({
          next: (cenad) => {
            if (cenad) {
              console.log('CENAD cargado para el usuario Gestor:', cenad);
              // Aquí podrías guardar en un signal o propiedad local
              this.cenad.set(cenad);
            } else {
              console.warn(`No se encontró un CENAD para el usuario ${this.usuario().username}`);
            }
          },
          error: (error) => {
            console.error('Error al cargar CENAD para usuario Gestor:', error);
          }
        });
        break;
      case this.rolUsuario.Normal:
        this.orquestadorService.loadUnidadDeUsuarioNormal(this.usuario().idString).subscribe({
          next: (unidad) => {
            if (unidad) {
              console.log('Unidad cargada para el usuario Normal:', unidad);
              // Aquí podrías guardar en un signal o propiedad local
              this.unidad.set(unidad);
            } else {
              console.warn(`No se encontró una Unidad para el usuario ${this.usuario().username}`);
            }
          },
          error: (error) => {
            console.error('Error al cargar Unidad para usuario Normal:', error);
          }
        });
        break;
      default:
        break;
    }
  }

  ngOnInit(): void {
    this.cargarCenadOUnidad();
  }

}
