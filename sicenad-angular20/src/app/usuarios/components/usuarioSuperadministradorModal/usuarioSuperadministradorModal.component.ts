import { JsonPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-usuarioSuperadministrador-modal',
  imports: [ReactiveFormsModule, FontAwesomeModule, JsonPipe],
  templateUrl: './usuarioSuperadministradorModal.component.html',
  styleUrls: ['./usuarioSuperadministradorModal.component.css']
})
export class UsuarioSuperadministradorModalComponent {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  usuarioSuperadministrador = input<UsuarioSuperAdministrador>();
  output = output<void>();


  // --- State ---
  idUsuarioSuperadministrador = computed(() => this.usuarioSuperadministrador()?.idString || '');
  _idModal = signal('modal-usuarioSuperadministrador-' + this.idUsuarioSuperadministrador());
  _idModalEliminar = signal('modal-usuarioSuperadministrador-eliminar-' + this.idUsuarioSuperadministrador());
  idModal = computed(() => this._idModal() + this.idUsuarioSuperadministrador());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idUsuarioSuperadministrador());

  usuarioForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    emailAdmitido: [false],
    descripcion: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.usuarioSuperadministrador()) {
      this.usuarioForm.patchValue({
        username: this.usuarioSuperadministrador()?.username || '',
        tfno: this.usuarioSuperadministrador()?.tfno || '',
        email: this.usuarioSuperadministrador()?.email || '',
        emailAdmitido: this.usuarioSuperadministrador()?.emailAdmitido || false,
        descripcion: this.usuarioSuperadministrador()?.descripcion || '',
      });
    }
  }

  get username() { return this.usuarioForm.get('username'); }
  get tfno() { return this.usuarioForm.get('tfno'); }
  get email() { return this.usuarioForm.get('email'); }
  get emailAdmitido() { return this.usuarioForm.get('emailAdmitido'); }
  get descripcion() { return this.usuarioForm.get('descripcion'); }

  editarUsuario() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    const { username, tfno, email, emailAdmitido, descripcion } = this.usuarioForm.value;
    this.orquestadorService.actualizarUsuarioSuperadministrador(username, tfno, email, emailAdmitido, descripcion, this.idUsuarioSuperadministrador()).subscribe({
      next: res => {
        if (res) {
          console.log(`Usuario Superadministrador ${username} actualizado correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Usuario Superadministrador:', error);
      }
    });
  }
  borrarUsuario() {
    this.orquestadorService.borrarUsuarioSuperadministrador(this.idUsuarioSuperadministrador()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
 }
