import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-usuario-modal',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslateModule, UpperCasePipe],
  templateUrl: './usuarioModal.component.html',
  styleUrls: ['./usuarioModal.component.css']
})
export class UsuarioModalComponent {
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  misRoles = RolUsuario;

  faEditUser = this.iconos.faEditUser;

  // --- Inputs / Outputs ---
  usuario = input<Usuario>();
  cenad = input<Cenad | undefined>();
  unidad = input<Unidad | undefined>();
  isMiUsuario = input<boolean>(false);
  output = output<void>();

  get usuarioTipado(): UsuarioSuperAdministrador | UsuarioAdministrador | UsuarioGestor | UsuarioNormal {
    switch (this.usuario()?.rol) {
      case this.misRoles.Superadministrador:
        return this.usuario() as UsuarioSuperAdministrador;
      case this.misRoles.Administrador:
        return this.usuario() as UsuarioAdministrador;
      case this.misRoles.Gestor:
        return this.usuario() as UsuarioGestor;
      case this.misRoles.Normal:
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
  cambiarPassword = signal(false);

  usuarioForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
    password: ['']
  });

  get username() { return this.usuarioForm.get('username'); }
  get tfno() { return this.usuarioForm.get('tfno'); }
  get email() { return this.usuarioForm.get('email'); }
  get emailAdmitido() { return this.usuarioForm.get('emailAdmitido'); }
  get descripcion() { return this.usuarioForm.get('descripcion'); }
  get password() { return this.usuarioForm.get('password'); }

  cambiarPasswordEffect = effect(() => {
    if (!this.cambiarPassword()) {
      this.usuarioForm.get('password')?.reset();
    }
  });

  ngOnInit(): void {
    if (this.usuario()) {
      this.usuarioForm.patchValue({
        username: this.usuario()?.username || '',
        tfno: this.usuario()?.tfno || '',
        email: this.usuario()?.email || '',
        emailAdmitido: this.usuario()?.emailAdmitido || false,
        descripcion: this.usuario()?.descripcion || '',
        password: ''
      });
    }
  }

  changePassword(idUsuario: string, password: string) {
    this.orquestadorService.changePassword(
      idUsuario,
      password
    ).subscribe({
      next: res => {
        console.log('✅ Cambio de contraseña correcto', res);
      },
      error: err => {
        console.error('❌ Error cambiando contraseña', err);
      },
      complete: () => {
        this.usuarioForm.patchValue({ password: '' });
        this.cambiarPassword.set(false);
      }
    });
  }

  editarUsuario() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    const { username, tfno, email, emailAdmitido, descripcion, password } = this.usuarioForm.value;
    const idUsuario = this.usuario()!.idString;
    switch (this.usuario()?.rol) {
      case this.misRoles.Superadministrador:
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
              password && this.changePassword(idUsuario, password);
              this.output.emit(); // notificamos al padre
            }
          },
          error: error => console.error(error)
        });
        break;
      case this.misRoles.Administrador:
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
              password && this.changePassword(idUsuario, password);
              this.output.emit(); // notificamos al padre
            }
          },
          error: error => console.error(error)
        });
        break;
      case this.misRoles.Gestor:
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
              password && this.changePassword(idUsuario, password);
              this.output.emit(); // notificamos al padre
            }
          },
          error: error => console.error(error)
        });
        break;
      case this.misRoles.Normal:
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
              password && this.changePassword(idUsuario, password);
              this.output.emit(); // notificamos al padre
            }
          },
          error: error => console.error(error)
        });
        break;
      default:
    }
  }

  borrarUsuario() {
    switch (this.usuario()?.rol) {
      case this.misRoles.Superadministrador:
        this.orquestadorService.borrarUsuarioSuperadministrador(this.idUsuario()).subscribe(() => {
          this.output.emit();
        });
        break;
      case this.misRoles.Administrador:
        this.orquestadorService.borrarUsuarioAdministrador(this.idUsuario()).subscribe(() => {
          this.output.emit();
        });
        break;
      case this.misRoles.Gestor:
        this.orquestadorService.borrarUsuarioGestor(this.cenad()?.idString || '', this.idUsuario()).subscribe(() => {
          this.output.emit();
        });
        break;
      case this.misRoles.Normal:
        this.orquestadorService.borrarUsuarioNormal(this.idUsuario()).subscribe(() => {
          this.output.emit();
        });
        break;
      default:
    }
  }
}
