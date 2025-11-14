import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Recurso } from '@interfaces/models/recurso';
import { TranslateModule } from '@ngx-translate/core';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-recursoModal',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslateModule, UpperCasePipe],
  templateUrl: './recursoModal.component.html',
  styleUrls: ['./recursoModal.component.css'],
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
  idRecurso = computed(() => this.recurso()?.Id || '');
  _idModal = signal('modal-recurso-' + this.recurso()?.Id);
  _idModalEliminar = signal('modal-recurso-eliminar-' + this.recurso()?.Id);
  idModal = computed(() => this._idModal() + this.idRecurso());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idRecurso());

  recursoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    otros: [''],
    categoria: [null, Validators.required],
    tipoFormulario: [null, Validators.required],
    usuarioGestor: [null, Validators.required],
  });

  get nombre() {
    return this.recursoForm.get('nombre');
  }
  get descripcion() {
    return this.recursoForm.get('descripcion');
  }
  get otros() {
    return this.recursoForm.get('otros');
  }
  get categoria() {
    return this.recursoForm.get('categoria');
  }
  get tipoFormulario() {
    return this.recursoForm.get('tipoFormulario');
  }
  get usuarioGestor() {
    return this.recursoForm.get('usuarioGestor');
  }

  ngOnInit(): void {
    if (!this.recurso()) return;
    // Cargar los valores básicos
    this.recursoForm.patchValue({
      nombre: this.recurso()?.nombre || '',
      descripcion: this.recurso()?.descripcion || '',
      otros: this.recurso()?.otros || '',
      categoria: this.recurso()!.categoria,
      tipoFormulario: this.recurso()!.tipoFormulario,
      usuarioGestor: this.recurso()!.usuarioGestor,
    });
    console.log(this.recursoForm.value);
    // Intentamos resolver las referencias a las instancias que están en los stores
    // (las select comparan por referencia, por eso es necesario asignar la misma instancia)
    this.resolveReferencesFromStores();
  }
  constructor() {
    // Además, si las listas se cargan de forma asíncrona después del init, volvemos a intentar
    effect(() => {
      if (!this.recurso()) return;
      // Leer las computeds para que el effect se dispare cuando cambien
      const _cats = this.categorias();
      const _tipos = this.tiposFormulario();
      const _users = this.usuariosGestor();
      // Si al menos una lista contiene elementos reintentar resolver
      if ((_cats && _cats.length) || (_tipos && _tipos.length) || (_users && _users.length)) {
        this.resolveReferencesFromStores();
      }
    });
  }
  private resolveReferencesFromStores() {
    const recurso = this.recurso();
    if (!recurso) return;
    const categorias = this.categorias() || [];
    const tipos = this.tiposFormulario() || [];
    const usuarios = this.usuariosGestor() || [];
    const catId = (recurso as any)?.categoria?.Id ?? (recurso as any)?.categoriaId ?? null;
    const tipoId = (recurso as any)?.tipoFormulario?.Id ?? (recurso as any)?.tipoFormularioId ?? null;
    const usuarioId = (recurso as any)?.usuarioGestor?.Id ?? (recurso as any)?.usuarioGestorId ?? null;
    const categoriaRef = categorias.find((c: any) => String(c?.Id) === String(catId)) || null;
    const tipoRef = tipos.find((t: any) => String(t?.Id) === String(tipoId)) || null;
    const usuarioRef = usuarios.find((u: any) => String(u?.Id) === String(usuarioId)) || null;
    // Solo parcheamos si encontramos las referencias correctas (o null explícito)
    this.recursoForm.patchValue({
      categoria: categoriaRef,
      tipoFormulario: tipoRef,
      usuarioGestor: usuarioRef,
    });
  }

  editarRecurso() {
    if (this.recursoForm.invalid) {
      this.recursoForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, otros, categoria, tipoFormulario, usuarioGestor } =
      this.recursoForm.value;
    let otrosVacio = '';
    if (otros) {
      otrosVacio = otros;
    }
    this.orquestadorService
      .actualizarRecurso(
        nombre,
        descripcion,
        otrosVacio,
        this.cenadVisitado()!.Id,
        tipoFormulario.Id,
        categoria.Id,
        usuarioGestor.Id,
        this.idRecurso()
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.output.emit(); // notificamos al padre
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  borrarRecurso() {
    this.orquestadorService
      .borrarRecurso(this.idRecurso(), this.cenadVisitado()!)
      .subscribe(() => {
        this.output.emit(); // notificamos al padre
      });
  }
}
