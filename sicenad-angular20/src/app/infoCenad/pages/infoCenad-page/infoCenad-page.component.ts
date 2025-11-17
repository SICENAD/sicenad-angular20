import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilService } from '@services/utilService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-infoCenad',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, TranslateModule, UpperCasePipe],
  templateUrl: './infoCenad-page.component.html',
  styleUrls: ['./infoCenad-page.component.css'],
})
export class InfoCenadPageComponent {
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private utils = inject(UtilsStore);
  private iconosStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private fb = inject(FormBuilder);
  private idiomaService = inject(IdiomaService);

  faVolver = this.iconosStore.faVolver;
  routesPaths = RoutesPaths;
  cambiaBoton = signal(false);
  btnVista = signal('Administrador');
  etiquetaBoton = signal<string>(this.idiomaService.t('homeCenadVisitado.btnAdmin'));
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  sizeMaxEscudoBytes = computed<number>(() => {
    const raw = this.sizeMaxEscudo();
    if (raw == null) return 0;
    const val = Number(raw);
    if (isNaN(val) || val <= 0) return 0;
    // Si el valor parece ya estar en bytes (>= 1 MiB), devolver tal cual.
    // Si es un número pequeño (p. ej. 1..1000) lo interpretamos como MB.
    if (val >= 1024 * 1024) return Math.floor(val);
    // Interpretar como MB por defecto
    return Math.floor(val * 1024 * 1024);
  });
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  isAdminEsteCenad = signal(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  previewInfoCenad = signal<string>('');
  infoCenadActual = signal<string>(this.cenadVisitado()?.infoCenad || '');
  urlInfoCenadActual = signal<string>('');
  infoCenadFile = signal<File | null>(null);
  cenadForm: FormGroup = this.fb.group({
    direccion: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    descripcion: ['', Validators.required],
    infoCenad: [null], // archivo opcional, se reemplaza si se carga uno nuevo
  });

  get direccion() {
    return this.cenadForm.get('direccion');
  }
  get tfno() {
    return this.cenadForm.get('tfno');
  }
  get email() {
    return this.cenadForm.get('email');
  }
  get descripcion() {
    return this.cenadForm.get('descripcion');
  }
  get infoCenad() {
    return this.cenadForm.get('infoCenad');
  }

  private esperarYCargarInfoCenad = void effect(() => {
    this.infoCenadActual.set(this.cenadVisitado()?.infoCenad || '');
    const infoCenad = this.cenadVisitado()?.infoCenad;
    if (!infoCenad) return;
    if (!this.cenadVisitado()) return;
    this.orquestadorService.getInfoCenad(infoCenad, this.cenadVisitado()!.nombre).subscribe({
      next: (blob) => this.urlInfoCenadActual.set(URL.createObjectURL(blob)),
      error: (err) => console.error(err),
    });
  });

  adminEsteCenadEffect = effect(() => {
    this.isAdminDeEsteCenad();
  });

  isAdminDeEsteCenad() {
    this.isAdminEsteCenad.set(
      this.auth.rol() === RolUsuario.Administrador &&
        this.cenadVisitado()?.Id === this.usuarioLogueado.cenadPropio()?.Id
    );
  }

  cambiaRol() {
    if (this.cambiaBoton()) {
      this.cambiaBoton.set(false);
    } else {
      this.cambiaBoton.set(true);
    }
    this.btnVista.set(this.cambiaBoton() ? 'Previa' : 'Administrador');
    this.etiquetaBoton.set(
      this.cambiaBoton()
        ? this.idiomaService.t('homeCenadVisitado.btnPrevia')
        : this.idiomaService.t('homeCenadVisitado.btnAdmin')
    );
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
        infoCenad: this.cenadVisitado()?.infoCenad,
      });
    }
  }

  onFileChange(event: any) {
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) {
      this.cenadForm.patchValue({ infoCenad: null });
      this.infoCenadFile.set(null);
      return;
    }
    const maxBytes = this.sizeMaxEscudoBytes();
    if (typeof maxBytes === 'number' && maxBytes > 0 && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error'); // limpiar selección visual y formulario
      try {
        if (this.fileInput && this.fileInput.nativeElement) this.fileInput.nativeElement.value = '';
      } catch {}
      this.cenadForm.patchValue({ infoCenad: null });
      this.infoCenadFile.set(null);
      return;
    }
    // aceptado
    this.cenadForm.patchValue({ infoCenad: file });
    const reader = new FileReader();
    reader.onload = (e) => this.previewInfoCenad.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.infoCenadFile.set(file);
  }

  editarInfoCenad() {
    if (this.cenadForm.invalid) {
      this.cenadForm.markAllAsTouched();
      return;
    }
    const { direccion, tfno, email, descripcion } = this.cenadForm.value;
    const archivoInfoCenad = this.infoCenadFile();
    this.orquestadorService
      .actualizarInfoCenad(
        this.cenadVisitado()!.nombre,
        direccion,
        tfno,
        email,
        descripcion,
        archivoInfoCenad, // archivo opcional
        this.infoCenadActual(), // archivo anterior
        this.cenadVisitado()!.Id
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.infoCenadActual.set(res);
            this.cenadVisitado()!.infoCenad = this.infoCenadActual(); // actualizamos el infoCenad en el objeto cenad
            // 🔹 Pedimos el archivo actualizado para refrescar la URL
            this.orquestadorService.getInfoCenad(res, this.cenadVisitado()!.nombre).subscribe({
              next: (blob) => {
                // Revocamos la URL anterior para evitar fugas de memoria
                const oldUrl = this.urlInfoCenadActual();
                if (oldUrl) URL.revokeObjectURL(oldUrl);
                // Asignamos la nueva URL
                this.urlInfoCenadActual.set(URL.createObjectURL(blob));
              },
              error: (err) => console.error(err),
            });
            this.cenadForm.patchValue({ infoCenad: null });
            this.previewInfoCenad.set('');
            this.infoCenadFile.set(null);
            if (this.fileInput) this.fileInput.nativeElement.value = '';
          }
        },
      });
  }
}
