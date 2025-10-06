import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioComponent } from '@app/usuarios/components/usuario/usuario.component';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';

@Component({
  selector: 'app-usuariosNormal-page',
  imports: [UsuarioComponent, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './usuariosNormal-page.component.html',
  styleUrls: ['./usuariosNormal-page.component.css']
})
export class UsuariosNormalPageComponent {
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);
  private idiomaService = inject(IdiomaService);

  usuariosNormales = computed(() => this.datosPrincipalesStore.usuariosNormal());
  unidades = computed(() => this.datosPrincipalesStore.unidades());
  usuarioForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
    unidad: [null, Validators.required]
  });

  get username() {
    return this.usuarioForm.get('username');
  }
  get password() {
    return this.usuarioForm.get('password');
  }
  get tfno() {
    return this.usuarioForm.get('tfno');
  }
  get email() {
    return this.usuarioForm.get('email');
  }
  get descripcion() {
    return this.usuarioForm.get('descripcion');
  }
  get emailAdmitido() {
    return this.usuarioForm.get('emailAdmitido');
  }
  get unidad() {
    return this.usuarioForm.get('unidad');
  }

  async crearUsuario() {
    if (this.usuarioForm.invalid) {
      alert(this.idiomaService.t('administracion.feedbackCompleta'));
      return;
    }
    const { username, password, tfno, email, emailAdmitido, descripcion, unidad } = this.usuarioForm.value;
    if (!unidad) {
      alert(this.idiomaService.t('usuarios.seleccionaUnidad'));
      return;
    }
    this.orquestadorService.registerUsuarioNormal(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      unidad.idString
    ).subscribe({
      next: (res) => {
        this.usuarioForm.reset();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
