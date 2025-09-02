import { Component, signal, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UsuarioService } from '@services/usuarioService';
import { AuthStore } from '@stores/auth.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginComponent {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private auth = inject(AuthStore);
  private iconos = inject(IconosStore);
  faHome = this.iconos.faHome;
  readonly routesPaths = RoutesPaths;

  username = signal('');
  password = signal('');
  feedback = signal('');

  formularioValidado = computed(() =>
    this.username().trim() !== '' &&
    this.password().trim() !== ''
  );

  login() {
    this.usuarioService.login(this.username(), this.password()).subscribe({
      next: (res) => {
        this.feedback.set('');
        this.auth.loginSuccessfull(res.token, res.username, res.rol);
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.feedback.set('Usuario o contraseña incorrectos');
      }
    });
  }
}
