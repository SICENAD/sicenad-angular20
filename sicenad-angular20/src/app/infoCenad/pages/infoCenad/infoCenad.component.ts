import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-infoCenad',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './infoCenad.component.html',
  styleUrls: ['./infoCenad.component.css']
})
export class InfoCenadComponent {
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private utils = inject(UtilsStore);
  private iconosStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);

  faVolver = this.iconosStore.faVolver;
  routesPaths = RoutesPaths;
  cambiaBoton = signal(false);
  rol = signal("Administrador");
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.cenadVisitado()?.idString === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
  });

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  previewInfoCenad = signal<string>('');
  infoCenadActual = signal<string>((this.cenadVisitado()?.infoCenad || ''));
  urlInfoCenadActual = signal<string>('');
  infoCenadFile = signal<File | null>(null);
  cenadForm: FormGroup = this.fb.group({
    direccion: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    descripcion: ['', Validators.required],
    infoCenad: [null] // archivo opcional, se reemplaza si se carga uno nuevo
  });

  private esperarYCargarInfoCenad = void effect(() => {
    this.infoCenadActual.set(this.cenadVisitado()?.infoCenad || '');
    const infoCenad = this.cenadVisitado()?.infoCenad;
    if (!infoCenad) return;
    if (!this.cenadVisitado()) return;
    this.orquestadorService.getInfoCenad(infoCenad, this.cenadVisitado()!.idString).subscribe(
      {
        next: blob => this.urlInfoCenadActual.set(URL.createObjectURL(blob)),
        error: err => console.error('Error cargando infoCenad', err)
      });
  });

  cambiaRol() {
    if (this.cambiaBoton()) {
      this.cambiaBoton.set(false);
    } else {
      this.cambiaBoton.set(true);
    }
    this.rol.set(this.cambiaBoton() ? 'Previa' : 'Administrador');
  }

  ngOnDestroy() {
    const currentUrl = this.urlInfoCenadActual();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
  }

  ngOnInit(): void {
    if (this.cenadVisitado()) {
      this.cenadForm.patchValue({
        direccion: this.cenadVisitado()?.direccion,
        tfno: this.cenadVisitado()?.tfno,
        email: this.cenadVisitado()?.email,
        descripcion: this.cenadVisitado()?.descripcion,
        infoCenad: this.cenadVisitado()?.infoCenad
      });
    }
  }
  get direccion() { return this.cenadForm.get('direccion'); }
  get tfno() { return this.cenadForm.get('tfno'); }
  get email() { return this.cenadForm.get('email'); }
  get descripcion() { return this.cenadForm.get('descripcion'); }
  get infoCenad() { return this.cenadForm.get('infoCenad'); }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cenadForm.patchValue({ infoCenad: file });
      const reader = new FileReader();
      reader.onload = e => this.previewInfoCenad.set(e.target?.result as string)
      reader.readAsDataURL(file);
      this.infoCenadFile.set(file);
    } else {
      this.infoCenadFile.set(null);
    }
  }

  editarInfoCenad() {
    if (this.cenadForm.invalid) {
      this.cenadForm.markAllAsTouched();
      return;
    }
    const { direccion, tfno, email, descripcion } = this.cenadForm.value;
    const archivoInfoCenad = this.infoCenadFile();
    console.log('Archivo nuevo:', archivoInfoCenad);
    console.log('InfoCenad actual:', this.infoCenadActual());
    this.orquestadorService.actualizarInfoCenad(
      this.cenadVisitado()!.nombre,
      direccion,
      tfno,
      email,
      descripcion,
      archivoInfoCenad,             // archivo opcional
      this.infoCenadActual(),  // archivo anterior
      this.cenadVisitado()!.idString
    ).subscribe({
      next: res => {
        if (res) {
          console.log(`Cenad ${this.cenadVisitado()!.nombre} actualizado correctamente.`);
          this.infoCenadActual.set(res);
          this.cenadVisitado()!.infoCenad = this.infoCenadActual(); // actualizamos el infoCenad en el objeto cenad
          // 🔹 Pedimos el archivo actualizado para refrescar la URL
          this.orquestadorService.getInfoCenad(res, this.cenadVisitado()!.idString).subscribe({
            next: blob => {
              // Revocamos la URL anterior para evitar fugas de memoria
              const oldUrl = this.urlInfoCenadActual();
              if (oldUrl) URL.revokeObjectURL(oldUrl);
              // Asignamos la nueva URL
              this.urlInfoCenadActual.set(URL.createObjectURL(blob));
            },
            error: err => console.error('Error recargando imagen actualizada', err)
          });
          this.cenadForm.patchValue({ infoCenad: null });
          this.previewInfoCenad.set('');
          this.infoCenadFile.set(null);
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
      },
      error: (err) => {
        console.error('Error actualizando Cenad:', err);
      }
    });
  }
}
