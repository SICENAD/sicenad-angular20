import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterComponent {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private router = inject(Router);

  readonly routesPaths = RoutesPaths;
  username = signal('');
  password = signal('');
  tfno = signal('');
  email = signal('');
  emailAdmitido = signal(false);
  descripcion = signal('');
  passwordForRegisterFromUser = signal('');

  // Validadores
  private isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  private isValidPhone = (phone: string) => /^[0-9]{9}$/.test(phone);

  emailError = computed(() => {
    if (!this.email().trim()) return null;
    return this.isValidEmail(this.email()) ? null : 'El correo no es válido';
  });

  phoneError = computed(() => {
    if (!this.tfno().trim()) return null;
    return this.isValidPhone(this.tfno()) ? null : 'El teléfono debe tener 9 dígitos';
  });

  formularioValidado = computed(() =>
    this.username().trim() !== '' &&
    this.password().trim() !== '' &&
    this.tfno().trim() !== '' &&
    this.isValidPhone(this.tfno()) &&
    this.email().trim() !== '' &&
    this.isValidEmail(this.email()) &&
    this.descripcion().trim() !== ''
  );

  async solicitudRegistro() {
    const passwordForRegister = this.utils.passwordForRegister();
    passwordForRegister == this.passwordForRegisterFromUser()
      ?
      (this.orquestadorService.registerUsuario(
        this.username(),
        this.password(),
        this.tfno(),
        this.email(),
        this.emailAdmitido(),
        this.descripcion(),
        'Superadministrador'
      ).subscribe({
        next: (res) => {
          console.log('Registro correcto:', res);
        },
        error: (err) => {
          console.error('Error en registro:', err);
        }
      }), this.router.navigate([RoutesPaths.login])
      )
      : alert('El password introducido no es correcto');
  }
}
