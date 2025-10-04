import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';
import { CartografiaComponent } from "@app/cartografias/components/cartografia/cartografia.component";
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-cartografias',
  imports: [CartografiaComponent, FontAwesomeModule, ReactiveFormsModule, RouterLink, TranslateModule, UpperCasePipe],
  templateUrl: './cartografias-page.component.html',
  styleUrls: ['./cartografias-page.component.css']
})
export class CartografiasPageComponent {

  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  cartografias = computed(() => this.cenadStore.cartografias());
  escalas = signal<{ idEscala: number, nombre: string }[]>(this.utils.escalasCartografia());
  sizeMaxCartografia = computed(() => this.utils.sizeMaxCartografia());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.cenadVisitado()?.idString === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
  });

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  archivoFile = signal<File | null>(null);

  cartografiaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    escala: ['', Validators.required],
    nombreArchivo: [null, Validators.required]
  });

  get nombre() { return this.cartografiaForm.get('nombre'); }
  get descripcion() { return this.cartografiaForm.get('descripcion'); }
  get escala() { return this.cartografiaForm.get('escala'); }
  get nombreArchivo() { return this.cartografiaForm.get('nombreArchivo'); }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cartografiaForm.patchValue({ nombreArchivo: file });
      this.archivoFile.set(file);
    } else {
      this.cartografiaForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
    }
  }

  crearCartografia() {
    if (this.cartografiaForm.invalid) {
      this.cartografiaForm.markAllAsTouched();
      return;
    }
    const idCenad = this.cenadVisitado()?.idString || '';
    const { nombre, descripcion, escala, nombreArchivo } = this.cartografiaForm.value;
    this.orquestadorService.crearCartografia(nombre, descripcion, escala, nombreArchivo, idCenad).subscribe(success => {
      if (success) {
        this.cartografiaForm.reset();
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      }
    });
  }
}
