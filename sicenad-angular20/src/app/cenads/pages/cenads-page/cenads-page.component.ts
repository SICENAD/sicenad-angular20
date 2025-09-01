import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { CargaInicialStore } from '@stores/cargaInicial.store';
import { CenadService } from '@services/cenadService';
import { CenadComponent } from '@app/cenads/components/cenad/cenad.component';
@Component({
  selector: 'app-cenads-page',
  imports: [CenadComponent],
  templateUrl: './cenads-page.component.html',
  styleUrls: ['./cenads-page.component.css'],
})
export class CenadsPageComponent {

  private utils = inject(UtilsStore);
  private cargaInicial = inject(CargaInicialStore);
  private cenadService = inject(CenadService);
  cenads = computed(() => this.cargaInicial.cenads());
  provincias = signal<{ idProvincia: number, nombre: string }[]>(this.utils.provincias());
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  escudoFile = signal<any>(null);
  previewEscudo = signal<string | null>(null);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  nombre = signal('');
  provincia = signal(0);
  tfno = signal('');
  email = signal('');
  direccion = signal('');
  descripcion = signal('');
  escudo = signal('');

  // Validadores
  private isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  private isValidPhone = (phone: string) => /^[0-9]{9}$/.test(phone);

  emailError = computed(() => {
    if (!this.email().trim()) return null;
    return this.isValidEmail(this.email()) ? null : 'El correo no es válido';
  });

  phoneError = computed(() => {
    if (!this.tfno().trim()) return null;
    return this.isValidPhone(this.tfno()) ? null : 'El teléfono debe tener 9 dígitos';
  });

  formularioValidado = computed(() =>
    this.nombre().trim() !== '' &&
    this.provincia() > 0 &&
    this.direccion().trim() !== '' &&
    this.tfno().trim() !== '' &&
    this.isValidPhone(this.tfno()) &&
    this.email().trim() !== '' &&
    this.isValidEmail(this.email()) &&
    this.descripcion().trim() !== '' &&
    !!this.escudoFile());

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    this.escudoFile.set(file);
    if (file) {
      this.previewEscudo.set(URL.createObjectURL(file));
    } else {
      this.previewEscudo.set(null);
    }
  }

  onProvinciaChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value; // string
    // Convierte a número y evita NaN en caso de opción vacía
    this.provincia.set(value ? Number(value) : 0);
  }
  crearCenad() {
    const provinciaId: number = this.provincia();

    this.cenadService.crearCenad(
      this.nombre(),
      provinciaId,
      this.direccion(),
      this.tfno(),
      this.email(),
      this.descripcion(),
      this.escudoFile()
    ).subscribe(success => {
      if (success) {
        this.nombre.set('');
        this.provincia.set(0);
        this.direccion.set('');
        this.tfno.set('');
        this.email.set('');
        this.descripcion.set('');
        this.previewEscudo.set(null);
        this.escudoFile.set(null);
        this.fileInput.nativeElement.value = '';
      }
    });
  }
}
