import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilsStore } from '@stores/utils.store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { IdiomaService } from '@services/idiomaService';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterComponent {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private idiomaService = inject(IdiomaService);

  readonly routesPaths = RoutesPaths;
  registerForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
  });

  get username() {
    return this.registerForm.get('username');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get tfno() {
    return this.registerForm.get('tfno');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get descripcion() {
    return this.registerForm.get('descripcion');
  }
  get emailAdmitido() {
    return this.registerForm.get('emailAdmitido');
  }

  passwordForRegisterFromUser = signal('');

  async solicitudRegistro() {
    if (this.registerForm.invalid) {
      alert(this.idiomaService.t('administracion.feedbackCompleta'));
      return;
    }
    const { username, password, tfno, email, emailAdmitido, descripcion } = this.registerForm.value;
    const passwordForRegister = this.utils.passwordForRegister();
    passwordForRegister == this.passwordForRegisterFromUser()
      ?
      (this.orquestadorService.registerUsuarioSuperadministrador(
        username,
        password,
        tfno,
        email,
        emailAdmitido,
        descripcion
      ).subscribe({
        next: (res) => {
          this.passwordForRegisterFromUser.set('');
          this.router.navigate([RoutesPaths.login])
          console.log(res);
        },
        error: (err) => {
          console.error(err);
        }
      })
      )
      : alert(this.idiomaService.t('administracion.passwordIncorrecto'));
  }
}
