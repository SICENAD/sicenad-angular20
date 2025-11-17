import { Component, computed, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutesPaths } from '@app/app.routes';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { FicheroSolicitud } from '@interfaces/models/ficheroSolicitud';
import { Solicitud } from '@interfaces/models/solicitud';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { UtilsStore } from '@stores/utils.store';
import { FicheroSolicitudComponent } from '../ficheroSolicitud/ficheroSolicitud.component';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { IdiomaService } from '@services/idiomaService';
import { UtilService } from '@services/utilService';

@Component({
  selector: 'app-ficherosSolicitud',
  imports: [ReactiveFormsModule, FicheroSolicitudComponent, TranslateModule, UpperCasePipe],
  templateUrl: './ficherosSolicitud.component.html',
  styleUrls: ['./ficherosSolicitud.component.css'],
})
export class FicherosSolicitudComponent {
  private auth = inject(AuthStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private utils = inject(UtilsStore);
  private iconoStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private fb = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  archivoFile = signal<File | null>(null);

  faDownload = this.iconoStore.faDownload;
  readonly routesPaths = RoutesPaths;

  // Estado base
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());
  sizeMaxDocSolicitud = computed(() => this.utils.sizeMaxDocSolicitud());
  sizeMaxDocSolicitudBytes = computed<number>(() => {
    const raw = this.sizeMaxDocSolicitud();
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
  isGestorEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id) && (this.auth.rol() === RolUsuario.Gestor);
  });
  isAdminEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id) && (this.auth.rol() === RolUsuario.Administrador);
  });
  today = new Date();

  isFechaPosteriorAHoy(): boolean {
    const fechaStr = this.solicitud()?.fechaFinDocumentacion;
    if (!fechaStr) return true;
    const fecha = new Date(fechaStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    return fecha.getTime() >= today.getTime();
  }

  documentacion = input<FicheroSolicitud[]>();
  isCenad = input<boolean>();
  idSolicitud = input<string>();
  solicitud = input<Solicitud | null>();
  output = output<void>();

  ficheroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoriaFichero: [null, Validators.required],
    nombreArchivo: [null, Validators.required]
  });

  get nombre() { return this.ficheroForm.get('nombre'); }
  get descripcion() { return this.ficheroForm.get('descripcion'); }
  get categoriaFichero() { return this.ficheroForm.get('categoriaFichero'); }
  get nombreArchivo() { return this.ficheroForm.get('nombreArchivo'); }

onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    const file: File | null = input?.files && input.files[0];
    if (!file) {
      this.ficheroForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    const maxBytes = this.sizeMaxDocSolicitudBytes();
    if (typeof maxBytes === 'number' && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error');
      // limpiar selección
      input.value = '';
      this.ficheroForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    // aceptado
    this.ficheroForm.patchValue({ nombreArchivo: file });
    this.archivoFile.set(file);
  }

  descargar(fichero: FicheroSolicitud): void {
    const archivo = fichero.nombreArchivo;
    const nombreCenad = this.cenadVisitado()!.nombre;
    const idSolicitud = this.idSolicitud() || '';
    if (!archivo) {
      return;
    }
    this.orquestadorService.getArchivoSolicitud(archivo, nombreCenad, idSolicitud, this.isCenad()!).subscribe({
      error: (err) => {
        console.error(err);
      }
    });
  }

  crearFichero() {
    if (this.ficheroForm.invalid) {
      this.ficheroForm.markAllAsTouched();
      return;
    }
    const nombreCenad = this.cenadVisitado()?.nombre || '';
    const idSolicitud = this.idSolicitud() || '';
    const { nombre, descripcion, categoriaFichero, nombreArchivo } = this.ficheroForm.value;
    if (this.isCenad()) {
      this.orquestadorService.crearFicheroSolicitudCenad(nombre, descripcion, nombreArchivo, categoriaFichero.Id, nombreCenad, idSolicitud).subscribe(success => {
        if (success) {
          this.ficheroForm.reset();
          this.output.emit(); // notificamos al padre
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
      });
    } else {
      this.orquestadorService.crearFicheroSolicitudCenad(nombre, descripcion, nombreArchivo, categoriaFichero.Id, nombreCenad, idSolicitud).subscribe(success => {
        if (success) {
          this.ficheroForm.reset();
          this.output.emit(); // notificamos al padre
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
      });
    }

  }
}
