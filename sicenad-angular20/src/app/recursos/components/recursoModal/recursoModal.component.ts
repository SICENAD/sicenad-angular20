import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Recurso } from '@interfaces/models/recurso';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-recursoModal',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './recursoModal.component.html',
  styleUrls: ['./recursoModal.component.css']
})
export class RecursoModalComponent {

  private iconos = inject(IconosStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);

  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  recurso = input<Recurso>();
  output = output<void>();

  // --- State ---
  recursos = computed(() => this.cenadStore.recursos());
  categorias = computed(() => this.cenadStore.categorias());
  tiposFormulario = computed(() => this.datosPrincipalesStore.tiposFormulario());
  usuariosGestor = computed(() => this.cenadStore.usuariosGestor());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  idRecurso = computed(() => this.recurso()?.idString || '');
  _idModal = signal('modal-recurso-' + this.recurso()?.idString);
  _idModalEliminar = signal('modal-recurso-eliminar-' + this.recurso()?.idString);
  idModal = computed(() => this._idModal() + this.idRecurso());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idRecurso());

  recursoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    otros: [''],
    categoria: [null, Validators.required],
    tipoFormulario: [null, Validators.required],
    usuarioGestor: [null, Validators.required]
  });

  get nombre() { return this.recursoForm.get('nombre'); }
  get descripcion() { return this.recursoForm.get('descripcion'); }
  get otros() { return this.recursoForm.get('otros'); }
  get categoria() { return this.recursoForm.get('categoria'); }
  get tipoFormulario() { return this.recursoForm.get('tipoFormulario'); }
  get usuarioGestor() { return this.recursoForm.get('usuarioGestor'); }

  constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const recursoActual = this.recurso();
      const categorias = this.categorias();
      const tiposFormulario = this.tiposFormulario();
      const usuariosGestor = this.usuariosGestor();
      if (!categorias || !tiposFormulario || !usuariosGestor || !recursoActual) return;

      // Cargar la categoría del recurso
      this.orquestadorService.loadCategoriaDeRecurso(recursoActual.idString).subscribe({
        next: (categoria) => {
          const categoriaRef = categoria
            ? categorias.find(c => c.idString === categoria.idString) || null
            : null;

          this.recursoForm.patchValue({ categoria: categoriaRef });
        },
        error: () => {
          this.recursoForm.patchValue({ categoria: null });
        }
      });
      // Cargar el tipo de formulario del recurso
      this.orquestadorService.loadTipoFormularioDeRecurso(recursoActual.idString).subscribe({
        next: (tipoFormulario) => {
          const tipoFormularioRef = tipoFormulario
            ? tiposFormulario.find(t => t.idString === tipoFormulario.idString) || null
            : null;

          this.recursoForm.patchValue({ tipoFormulario: tipoFormularioRef });
        },
        error: () => {
          this.recursoForm.patchValue({ tipoFormulario: null });
        }
      });
      // Cargar el usuario gestor del recurso
      this.orquestadorService.loadUsuarioGestorDeRecurso(recursoActual.idString).subscribe({
        next: (usuarioGestor) => {
          const usuarioGestorRef = usuarioGestor
            ? usuariosGestor.find(u => u.idString === usuarioGestor.idString) || null
            : null;

          this.recursoForm.patchValue({ usuarioGestor: usuarioGestorRef });
        },
        error: () => {
          this.recursoForm.patchValue({ usuarioGestor: null });
        }
      });
    });
  }

  ngOnInit(): void {
    if (!this.recurso()) return;

    // Cargar los valores básicos
    this.recursoForm.patchValue({
      nombre: this.recurso()?.nombre || '',
      descripcion: this.recurso()?.descripcion || '',
      otros: this.recurso()?.otros || ''
    });
  }

  editarRecurso() {
    if (this.recursoForm.invalid) {
      this.recursoForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, otros, categoria, tipoFormulario, usuarioGestor } = this.recursoForm.value;
    let otrosVacio = '';
    if (otros) {
      otrosVacio = otros;
    }
    this.orquestadorService.actualizarRecurso(nombre, descripcion, otrosVacio, this.cenadVisitado()!.idString, tipoFormulario.idString, categoria.idString, usuarioGestor.idString, this.idRecurso()).subscribe({
      next: res => {
        if (res) {
          console.log(`Recurso ${nombre} actualizado correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Categoría:', error);
      }
    });
  }
  
  borrarRecurso() {
    this.orquestadorService.borrarRecurso(this.idRecurso(), this.cenadVisitado()!.idString).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
