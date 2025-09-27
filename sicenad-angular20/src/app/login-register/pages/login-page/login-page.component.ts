import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { IconosStore } from '@stores/iconos.store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginComponent {
  private router = inject(Router);
  private auth = inject(AuthStore);
  private iconos = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);

  faHome = this.iconos.faHome;
  readonly routesPaths = RoutesPaths;

  feedback = signal('');

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  // Getter para acceder fácilmente a los controles
  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

 login() {
    if (this.loginForm.invalid) {
      this.feedback.set('Por favor, completa todos los campos.');
      return;
    }
    const { username, password } = this.loginForm.value;
    this.orquestadorService.loginUsuario(username, password).subscribe({
      next: (res) => {
        this.feedback.set('');
        this.auth.getDatosSeguridad(res.token, res.username, res.rol);
        this.orquestadorService.initializeDatosPrincipales();
        this.orquestadorService.getDatosDeUsuario();
        this.router.navigate([this.routesPaths.home]);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.feedback.set('Usuario o contraseña incorrectos');
      }
    });
  }
}
