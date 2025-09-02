import { Component, signal, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginComponent {
  private router = inject(Router);
  private auth = inject(AuthStore);
  private iconos = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
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
    this.orquestadorService.loginUsuario(this.username(), this.password()).subscribe({
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
