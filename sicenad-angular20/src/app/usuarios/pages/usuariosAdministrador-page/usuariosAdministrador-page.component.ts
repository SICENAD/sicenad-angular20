import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioComponent } from '@app/usuarios/components/usuario/usuario.component';
import { Cenad } from '@interfaces/models/cenad';
import { OrquestadorService } from '@services/orquestadorService';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';

@Component({
  selector: 'app-usuariosAdministrador-page',
  imports: [UsuarioComponent, ReactiveFormsModule],
  templateUrl: './usuariosAdministrador-page.component.html',
  styleUrls: ['./usuariosAdministrador-page.component.css']
})

export class UsuariosAdministradorPageComponent {
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);

  usuariosAdministrador = computed(() => this.datosPrincipalesStore.usuariosAdministrador());
  cenadsSinAdmin = signal<Cenad[] | null>(null);
  usuarioForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
    cenad: [null, Validators.required]
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
  get cenad() {
    return this.usuarioForm.get('cenad');
  }

  async crearUsuario() {
    if (this.usuarioForm.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }
    const { username, password, tfno, email, emailAdmitido, descripcion, cenad } = this.usuarioForm.value;
        if (!cenad) {
      alert('Selecciona un CENAD.');
      return;
    }
    this.orquestadorService.registerUsuarioAdministrador(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      cenad.idString
    ).subscribe({
      next: (res) => {
        console.log('Registro correcto:', res);
        this.usuarioForm.reset();

      },
      error: (err) => {
        console.error('Error en registro:', err);
      }
    });

  }

  private cargarCenadsSinAdmin(): void {
    this.orquestadorService.loadCenadsSinAdmin().subscribe({
      next: (cenads) => {
        this.cenadsSinAdmin.set(cenads);
        console.log('CENADs sin admin cargados:', cenads);
      },
      error: (error) => {
        console.error('Error al cargar CENADs sin admin:', error);
      }
    });
  }

  ngOnInit(): void {
    this.cargarCenadsSinAdmin();
  }
}
