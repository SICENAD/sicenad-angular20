import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FicherosRecursoComponent } from '@app/ficheros/components/ficherosRecurso/ficherosRecurso/ficherosRecurso.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { Categoria } from '@interfaces/models/categoria';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { Recurso } from '@interfaces/models/recurso';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-recursoDetalle',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, FicherosRecursoComponent],
  templateUrl: './recursoDetalle-page.component.html',
  styleUrls: ['./recursoDetalle-page.component.css']
})
export class RecursoDetallePageComponent {
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private utils = inject(UtilsStore);
  private iconosStore = inject(IconosStore);
  private orquestadorService = inject(OrquestadorService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  faVolver = this.iconosStore.faVolver;
  routesPaths = RoutesPaths;
  cambiaBoton = signal(false);
  btnVista = signal("Gestor");
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  idRecurso = computed(() => this.route.snapshot.params['idRecurso']);
  usuariosGestor = computed(() => this.cenadStore.usuariosGestor());
  categorias = computed(() => this.cenadStore.categorias());
  recursos = computed(() => this.cenadStore.recursos());
  idGestorDelRecurso = signal<string>('');
  categoria = signal<Categoria | null>(null);
  recurso = signal<Recurso | null>(null);
  ficheros = signal<FicheroRecurso[]>([]);

  isGestorEsteRecurso = computed(() => {
    return (this.usuarioLogueado.usuarioLogueado()?.idString === this.idGestorDelRecurso()) && (this.auth.rol() === RolUsuario.Gestor);
  });

  recursoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    otros: [''],
    conDatosEspecificosSolicitud: [false],
    datosEspecificosSolicitud: ['']
  });

  get nombre() { return this.recursoForm.get('nombre'); }
  get descripcion() { return this.recursoForm.get('descripcion'); }
  get otros() { return this.recursoForm.get('otros'); }
  get conDatosEspecificosSolicitud() { return this.recursoForm.get('conDatosEspecificosSolicitud'); }
  get datosEspecificosSolicitud() { return this.recursoForm.get('datosEspecificosSolicitud'); }

  constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const recursos = this.recursos();
      this.orquestadorService.loadRecursoSeleccionado(this.idRecurso()).subscribe({
        next: (recurso) => {
          const recursoRef = recurso
            ? recursos.find(r => r.idString === recurso.idString) || null
            : null;
          this.recurso.set(recursoRef);
          // ✅ Aquí actualizamos el formulario cuando se cargue el recurso
          if (recursoRef) {
            this.recursoForm.patchValue({
              nombre: recursoRef.nombre || '',
              descripcion: recursoRef.descripcion || '',
              otros: recursoRef.otros || '',
              conDatosEspecificosSolicitud: recursoRef.conDatosEspecificosSolicitud || false,
              datosEspecificosSolicitud: recursoRef.datosEspecificosSolicitud || ''
            });
          }
        },
        error: () => {
        }
      });
      const recursoActual = this.recurso();
      const categorias = this.categorias();
      const usuariosGestor = this.usuariosGestor();
      if (!usuariosGestor || !categorias || !recursoActual) return;
      if (this.idRecurso() === undefined) return;
      // Cargar la categoría del recurso
      this.orquestadorService.loadCategoriaDeRecurso(this.idRecurso()).subscribe({
        next: (categoria) => {
          const categoriaRef = categoria
            ? categorias.find(c => c.idString === categoria.idString) || null
            : null;

          this.categoria.set(categoriaRef ? categoriaRef : null);
        },
        error: () => {
        }
      });
      // Cargar el usuario gestor del recurso
      this.orquestadorService.loadUsuarioGestorDeRecurso(this.idRecurso()).subscribe({
        next: (usuarioGestor) => {
          const usuarioGestorRef = usuarioGestor
            ? usuariosGestor.find(u => u.idString === usuarioGestor.idString) || null
            : null;
          this.idGestorDelRecurso.set(usuarioGestorRef ? usuarioGestorRef.idString : '');
        },
        error: () => {
        }
      });
    });
    // Cargar los ficheros del recurso
    this.recargarFicheros();
  }

  cambiaRol() {
    if (this.cambiaBoton()) {
      this.cambiaBoton.set(false);
    } else {
      this.cambiaBoton.set(true);
    }
    this.btnVista.set(this.cambiaBoton() ? 'Previa' : 'Gestor');
  }

  actualizarRecurso() {
    if (this.recursoForm.invalid) {
      this.recursoForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, otros, conDatosEspecificosSolicitud, datosEspecificosSolicitud } = this.recursoForm.value;
    this.orquestadorService.actualizarRecursoDetalle(
      nombre,
      descripcion,
      otros,
      conDatosEspecificosSolicitud,
      datosEspecificosSolicitud,
      this.cenadVisitado()!.idString,
      this.idRecurso()
    ).subscribe({
      next: res => {
        if (res) {
          console.log(`Recurso ${nombre} actualizado correctamente.`);
        }
      },
      error: (err) => {
        console.error('Error actualizando recurso:', err);
      }
    });
  }

  recargarFicheros() {
    this.orquestadorService.loadFicherosDeRecurso(this.idRecurso()).subscribe({
      next: (ficheros) => {
        this.ficheros.set(ficheros ?? []);
      },
      error: () => {
      }
    });
  }
}
