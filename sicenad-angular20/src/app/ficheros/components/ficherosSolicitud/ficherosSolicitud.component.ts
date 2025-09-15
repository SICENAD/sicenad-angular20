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

@Component({
  selector: 'app-ficherosSolicitud',
  imports: [ReactiveFormsModule, FicheroSolicitudComponent],
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
  private fb = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  archivoFile = signal<File | null>(null);

  faDownload = this.iconoStore.faDownload;
  readonly routesPaths = RoutesPaths;

  // Estado base
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());
  sizeMaxDocSolicitud = computed(() => this.utils.sizeMaxDocSolicitud());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  isGestorEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.idString === this.cenadVisitado()?.idString) && (this.auth.rol() === RolUsuario.Gestor);
  });
  isAdminEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.idString === this.cenadVisitado()?.idString) && (this.auth.rol() === RolUsuario.Administrador);
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
    const file: File = event.target.files[0];
    if (file) {
      this.ficheroForm.patchValue({ nombreArchivo: file });
      this.archivoFile.set(file);
    } else {
      this.ficheroForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
    }
  }

  descargar(fichero: FicheroSolicitud): void {
    const archivo = fichero.nombreArchivo;
    const idCenad = this.cenadVisitado()!.idString;
    const idSolicitud = this.idSolicitud() || '';
    if (!archivo) {
      console.warn('No hay archivo para descargar');
      return;
    }
    this.orquestadorService.getArchivoSolicitud(archivo, idCenad, idSolicitud).subscribe({
      next: () => {
        console.log(`Archivo ${archivo} descargado correctamente`);
      },
      error: (err) => {
        console.error('Error descargando el archivo', err);
      }
    });
  }

  crearFichero() {
    if (this.ficheroForm.invalid) {
      this.ficheroForm.markAllAsTouched();
      return;
    }
    const idCenad = this.cenadVisitado()?.idString || '';
    const idSolicitud = this.idSolicitud() || '';
    const { nombre, descripcion, categoriaFichero, nombreArchivo } = this.ficheroForm.value;
    if (this.isCenad()) {
      this.orquestadorService.crearFicheroSolicitudCenad(nombre, descripcion, nombreArchivo, categoriaFichero.idString, idCenad, idSolicitud).subscribe(success => {
        if (success) {
          this.ficheroForm.reset();
          this.output.emit(); // notificamos al padre
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        } else {
          console.error('Error al crear el fichero');
        }
      });
    } else {
      this.orquestadorService.crearFicheroSolicitudCenad(nombre, descripcion, nombreArchivo, categoriaFichero.idString, idCenad, idSolicitud).subscribe(success => {
        if (success) {
          this.ficheroForm.reset();
          this.output.emit(); // notificamos al padre
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        } else {
          console.error('Error al crear el fichero');
        }
      });
    }

  }
}
