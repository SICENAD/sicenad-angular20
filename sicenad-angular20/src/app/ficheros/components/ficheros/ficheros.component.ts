import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FicheroComponent } from '../fichero/fichero.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { RoutesPaths } from '@app/app.routes';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';
import { forkJoin, map } from 'rxjs';
import { UtilService } from '@services/utilService';

@Component({
  selector: 'app-ficheros',
  imports: [FicheroComponent, ReactiveFormsModule],
  templateUrl: './ficheros.component.html',
  styleUrls: ['./ficheros.component.css'],
})
export class FicherosComponent {
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private utils = inject(UtilsStore);
  private iconoStore = inject(IconosStore);
  private utilService = inject(UtilService);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  archivoFile = signal<File | null>(null);
  imagenModal = signal<FicheroRecurso | null>(null);
  showModal = signal<boolean>(false);
  categoriasFicheroImagenesMisFicheros = signal<CategoriaFichero[]>([]);
  categoriasFicheroNoImagenesMisFicheros = signal<CategoriaFichero[]>([]);

  faDownload = this.iconoStore.faDownload;
  readonly routesPaths = RoutesPaths;

  // Estado base
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());
  categorias = computed(() => this.cenadStore.categorias());
  sizeMaxDocRecurso = computed(() => this.utils.sizeMaxDocRecurso());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  imagenModalNombre = computed(() => this.utilService.toTitleCase(this.imagenModal()?.nombre || ''));

  btnVista = input<string>();
  ficheros = input<FicheroRecurso[]>();
  idRecurso = input<string>();
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

  constructor() {
    // Effect SOLO para obtener las categorías
    effect(() => {
      const ficheros = this.ficheros() || [];
      this.obtenerCategoriasMisFicheros(ficheros);
    });
    // Effect SOLO para cargar imágenes
    effect(() => {
      const categorias = this.categoriasFicheroImagenesMisFicheros();
      categorias.forEach((categoriaFichero: CategoriaFichero) => {
        categoriaFichero.ficheros!.forEach((fichero: FicheroRecurso) => {
          const nombreArchivo = fichero.nombreArchivo;
          const idCenad = this.cenadVisitado()!.idString;
          const idRecurso = this.idRecurso() || '';
          if (!nombreArchivo) return;
          this.orquestadorService.getImagenRecurso(nombreArchivo, idCenad, idRecurso).subscribe({
            next: blob => fichero.urlImagen = URL.createObjectURL(blob),
            error: err => console.error('Error cargando imagen del fichero', err)
          });
        });
      });
    });
  }

  descargar(fichero: FicheroRecurso): void {
    const archivo = fichero.nombreArchivo;
    const idCenad = this.cenadVisitado()!.idString;
    const idRecurso = this.idRecurso() || '';
    if (!archivo) {
      console.warn('No hay archivo para descargar');
      return;
    }
    this.orquestadorService.getArchivoRecurso(archivo, idCenad, idRecurso).subscribe({
      next: () => {
        console.log(`Archivo ${archivo} descargado correctamente`);
      },
      error: (err) => {
        console.error('Error descargando el archivo', err);
      }
    });
  }

  show(event: Event, fichero: FicheroRecurso): void {
    event.preventDefault(); // <- evita que el enlace recargue la página
    this.imagenModal.set(fichero); // tu lógica actual
    this.showModal.set(true);
  }
  hide() {
    this.showModal.set(false);
    this.imagenModal.set(null);
  }
  crearFichero() {
    if (this.ficheroForm.invalid) {
      this.ficheroForm.markAllAsTouched();
      return;
    }
    const idCenad = this.cenadVisitado()?.idString || '';
    const idRecurso = this.idRecurso() || '';
    const { nombre, descripcion, categoriaFichero, nombreArchivo } = this.ficheroForm.value;
    this.orquestadorService.crearFicheroRecurso(nombre, descripcion, nombreArchivo, categoriaFichero.idString, idCenad, idRecurso).subscribe(success => {
      if (success) {
        this.ficheroForm.reset();
        this.output.emit(); // notificamos al padre
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      } else {
        console.error('Error al crear el fichero');
      }
    });
  }

  // Llama al servicio para obtener datos y agruparlos
  obtenerCategoriasMisFicheros(ficheros: FicheroRecurso[]): void {
    if (!ficheros?.length) {
      this.categoriasFicheroImagenesMisFicheros.set([]);
      this.categoriasFicheroNoImagenesMisFicheros.set([]);
      return;
    }
    // Creamos un array de observables, uno por fichero
    const peticiones = ficheros.map(fichero =>
      this.orquestadorService.loadCategoriaFicheroDeFichero(fichero.idString).pipe(
        map(response => ({ ...response, fichero })) // agregamos el fichero original
      )
    );
    // Ejecutamos todas las llamadas en paralelo
    forkJoin(peticiones).subscribe({
      next: (categoriasFichero) => {
        // Agrupar por idString
        const mapaCategorias = new Map<string, CategoriaFichero>();
        for (const { idString, nombre, tipo, descripcion, fichero } of categoriasFichero) {
          const idStringKey = idString!; // <-- afirmamos que nunca será undefined
          const nombreKey = nombre!;
          const tipoKey = tipo!;
          const descripcionKey = descripcion!;
          if (!mapaCategorias.has(idStringKey)) {
            mapaCategorias.set(idStringKey, { idString: idStringKey, nombre: nombreKey, tipo: tipoKey, descripcion: descripcionKey, ficheros: [] });
          }
          mapaCategorias.get(idStringKey)!.ficheros!.push(fichero);
        }
        const categoriasUnicas = Array.from(mapaCategorias.values());
        // Actualizamos los signals
        this.categoriasFicheroImagenesMisFicheros.set(
          categoriasUnicas.filter(cat => cat.tipo === 0)
        );
        this.categoriasFicheroNoImagenesMisFicheros.set(
          categoriasUnicas.filter(cat => cat.tipo === 1)
        );
      },
      error: (error) => {
        console.error('Error obteniendo categorías de ficheros', error);
        this.categoriasFicheroImagenesMisFicheros.set([]);
        this.categoriasFicheroNoImagenesMisFicheros.set([]);
      }
    });
  }
}
