import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { Cenad } from '@interfaces/models/cenad';
import { Unidad } from '@interfaces/models/unidad';
import { Usuario } from '@interfaces/models/usuario';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { UsuarioNormal } from '@interfaces/models/usuarioNormal';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-usuario-modal',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './usuarioModal.component.html',
  styleUrls: ['./usuarioModal.component.css']
})
export class UsuarioModalComponent {
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEditUser = this.iconos.faEditUser;

  // --- Inputs / Outputs ---
  usuario = input<Usuario>();
  cenad = input<Cenad | undefined>();
  unidad = input<Unidad | undefined>();
  isMiUsuario = input<boolean>(false);
  output = output<void>();

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

  // --- State ---
  idUsuario = computed(() => this.usuario()?.idString || '');
  _idModal = signal('modal-usuario-' + this.idUsuario());
  _idModalEliminar = signal('modal-usuario-eliminar-' + this.idUsuario());
  idModal = computed(() => this._idModal() + this.idUsuario());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idUsuario());

  usuarioForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
  });

  get username() { return this.usuarioForm.get('username'); }
  get tfno() { return this.usuarioForm.get('tfno'); }
  get email() { return this.usuarioForm.get('email'); }
  get emailAdmitido() { return this.usuarioForm.get('emailAdmitido'); }
  get descripcion() { return this.usuarioForm.get('descripcion'); }
  
  ngOnInit(): void {
    if (this.usuario()) {
      this.usuarioForm.patchValue({
        username: this.usuario()?.username || '',
        tfno: this.usuario()?.tfno || '',
        email: this.usuario()?.email || '',
        emailAdmitido: this.usuario()?.emailAdmitido || false,
        descripcion: this.usuario()?.descripcion || '',
      });
    }
  }

  editarUsuario() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    const { username, tfno, email, emailAdmitido, descripcion } = this.usuarioForm.value;
    switch (this.usuario()?.rol) {
      case RolUsuario.Superadministrador:
        this.orquestadorService.actualizarUsuarioSuperadministrador(
          username,
          tfno,
          email,
          emailAdmitido,
          descripcion,
          this.idUsuario()
        ).subscribe({
          next: res => {
            if (res) {
              console.log(`Usuario Superadministrador ${username} actualizado correctamente.`);
              this.output.emit(); // notificamos al padre
            }
          },
          error: error => console.error('Error actualizando Usuario Superadministrador:', error)
        });
        break;
      case RolUsuario.Administrador:
        this.orquestadorService.actualizarUsuarioAdministrador(
          username,
          tfno,
          email,
          emailAdmitido,
          descripcion,
          this.cenad()?.idString || '',
          this.idUsuario()
        ).subscribe({
          next: res => {
            if (res) {
              console.log(`Usuario Administrador ${username} actualizado correctamente.`);
              this.output.emit();
            }
          },
          error: error => console.error('Error actualizando Usuario Administrador:', error)
        });
        break;
      case RolUsuario.Gestor:
        this.orquestadorService.actualizarUsuarioGestor(
          username,
          tfno,
          email,
          emailAdmitido,
          descripcion,
          this.cenad()?.idString || '',
          this.idUsuario()
        ).subscribe({
          next: res => {
            if (res) {
              console.log(`Usuario Gestor ${username} actualizado correctamente.`);
              this.output.emit();
            }
          },
          error: error => console.error('Error actualizando Usuario Gestor:', error)
        });
        break;
      case RolUsuario.Normal:
        this.orquestadorService.actualizarUsuarioNormal(
          username,
          tfno,
          email,
          emailAdmitido,
          descripcion,
          this.unidad()?.idString || '',
          this.idUsuario()
        ).subscribe({
          next: res => {
            if (res) {
              console.log(`Usuario Normal ${username} actualizado correctamente.`);
              this.output.emit();
            }
          },
          error: error => console.error('Error actualizando Usuario Normal:', error)
        });
        break;
      default:
        console.error('Rol no reconocido al actualizar usuario:', this.usuario()?.rol);
    }
  }

  borrarUsuario() {
    switch (this.usuario()?.rol) {
      case RolUsuario.Superadministrador:
        this.orquestadorService.borrarUsuarioSuperadministrador(this.idUsuario()).subscribe(() => {
          console.log('Usuario Superadministrador borrado correctamente.');
          this.output.emit();
        });
        break;
      case RolUsuario.Administrador:
        this.orquestadorService.borrarUsuarioAdministrador(this.idUsuario()).subscribe(() => {
          console.log('Usuario Administrador borrado correctamente.');
          this.output.emit();
        });
        break;
      case RolUsuario.Gestor:
        this.orquestadorService.borrarUsuarioGestor(this.cenad()?.idString || '', this.idUsuario()).subscribe(() => {
          console.log('Usuario Gestor borrado correctamente.');
          this.output.emit();
        });
        break;
      case RolUsuario.Normal:
        this.orquestadorService.borrarUsuarioNormal(this.idUsuario()).subscribe(() => {
          console.log('Usuario Normal borrado correctamente.');
          this.output.emit();
        });
        break;
      default:
        console.error('Rol no reconocido al borrar usuario:', this.usuario()?.rol);
    }
  }
}
