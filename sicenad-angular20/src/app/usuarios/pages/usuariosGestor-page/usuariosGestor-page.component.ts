import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioComponent } from '@app/usuarios/components/usuario/usuario.component';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';

@Component({
  selector: 'app-usuariosGestor-page',
  imports: [UsuarioComponent, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './usuariosGestor-page.component.html',
  styleUrls: ['./usuariosGestor-page.component.css']
})
export class UsuariosGestorPageComponent {
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);
  private idiomaService = inject(IdiomaService);

  usuariosGestorDeCenad = computed(() => this.cenadStore.usuariosGestor());
  cenad = computed(() => this.usuarioLogueado.cenadPropio());
  usuarioForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
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

  async crearUsuario() {
    if (this.usuarioForm.invalid) {
      alert(this.idiomaService.t('administracion.feedbackCompleta'));
      return;
    }
    const { username, password, tfno, email, emailAdmitido, descripcion } = this.usuarioForm.value;
    this.orquestadorService.registerUsuarioGestor(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      this.cenad()?.idString || ''
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
