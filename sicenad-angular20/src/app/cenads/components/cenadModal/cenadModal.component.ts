import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Cenad } from '@interfaces/models/cenad';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';
import { tap } from 'rxjs';

@Component({
  selector: 'app-cenad-modal',
  imports: [FontAwesomeModule],
  templateUrl: './cenadModal.component.html',
  styleUrls: ['./cenadModal.component.css'],
})
export class CenadModalComponent {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  cenad = input<Cenad>();
  output = output<void>();

  // --- State ---
  provincias = signal<{ idProvincia: number, nombre: string }[]>(this.utils.provincias());
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());

  nombre = signal<string>(this.cenad()?.nombre || '');
  direccion = signal<string>(this.cenad()?.direccion || '');
  provinciaSeleccionada = signal<number>(this.cenad()?.provincia || 0);
  tfno = signal<string>(this.cenad()?.tfno || '');
  email = signal<string>(this.cenad()?.email || '');
  descripcion = signal<string>(this.cenad()?.descripcion || '');
  escudoActual = signal<string>(this.cenad()?.escudo || '');
  urlEscudoActual = signal<string>(this.cenad()?.descripcion || '');
  archivoEscudo = signal<File | null>(null);
  previewEscudo = signal<string>('');
  idCenad = signal<string>(this.cenad()?.idString || '');

  _idModal = signal('modal-cenad-' + this.cenad()?.idString);
  _idModalEliminar = signal('modal-cenad-eliminar-' + this.cenad()?.idString);
  idModal = computed(() => this._idModal() + this.idCenad());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCenad());
  provincia = computed(() => this.cenad()?.provincia || 0);
  provinciaSeleccionadaNombre = computed(() => {
    return this.provincias().find(p => p.idProvincia === this.provinciaSeleccionada())?.nombre || '';
  });

  ngOnInit(): void {
    if (!this.cenad()) return;

  }
  private syncCenad = effect(() => {
    const c = this.cenad();
    if (!c) return;
    this.nombre.set(c.nombre);
    this.provinciaSeleccionada.set(c.provincia);
    this.direccion.set(c.direccion);
    this.tfno.set(c.tfno);
    this.email.set(c.email);
    this.descripcion.set(c.descripcion);
    this.escudoActual.set(c.escudo);
    this.idCenad.set(c.idString);
  });


  private esperarYCargarEscudo = void effect(() => {
    const escudo = this.cenad()?.escudo;
    if (!escudo) return;
    if (!this.idCenad()) return;
    this.orquestadorService.getEscudoCenad(escudo, this.idCenad()).subscribe({
      next: blob => this.urlEscudoActual.set(URL.createObjectURL(blob)),
      error: err => console.error('Error cargando escudo', err)
    });
  });

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.archivoEscudo.set(file);

    // Generamos preview
    const reader = new FileReader();
    reader.onload = e => this.previewEscudo.set((e.target?.result as string) || '');
    reader.readAsDataURL(file);
  }

  onProvinciaChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value; // string
    // Convierte a número y evita NaN en caso de opción vacía
    this.provinciaSeleccionada.set(Number(value));
  }
  provinciaSeleccionadaString = computed(() => this.provinciaSeleccionada()?.toString() || '');


  async editarCenad() {
    const provinciaId: number = this.provinciaSeleccionada();
    let nombreArchivo = '';
    this.orquestadorService.actualizarCenad(
      this.nombre(),
      provinciaId,
      this.direccion(),
      this.tfno(),
      this.email(),
      this.descripcion(),
      this.archivoEscudo(),
      this.escudoActual(),
      this.idCenad()
    ).subscribe(res => {
      if (res) {
        nombreArchivo = res;
        console.log(`Cenad ${this.nombre()} actualizado correctamente.`);
      }
        console.log('Cenad actualizado correctamente.' );

    if (nombreArchivo != '') {
      this.escudoActual.set(nombreArchivo);
      this.archivoEscudo.set(null);
      this.previewEscudo.set('');
    }})

    this.output.emit(); // Notificamos al componente padre
  }

  async borrarCenad() {
    this.orquestadorService.borrarCenad(this.idCenad()).subscribe();
    this.output.emit(); // Notificamos al componente padre
  }

  // Validaciones
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^[0-9]{9}$/.test(phone);
  }

  emailError(): string | null {
    if (!this.email().trim()) return null;
    return this.isValidEmail(this.email()) ? null : 'El correo no es válido';
  }

  phoneError(): string | null {
    if (!this.tfno().trim()) return null;
    return this.isValidPhone(this.tfno()) ? null : 'El teléfono debe tener 9 dígitos';
  }

  formularioValidado(): boolean {
    return (
      !!this.nombre().trim() &&
      this.provincia() != null &&
      !!this.tfno().trim() &&
      this.isValidPhone(this.tfno()) &&
      !!this.email().trim() &&
      this.isValidEmail(this.email()) &&
      !!this.descripcion().trim() &&
      !!this.direccion().trim()
    );
  }
}
