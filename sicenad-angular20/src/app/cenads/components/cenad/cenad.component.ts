// cenad.component.ts
import { Component, input, signal, computed, inject, effect } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { CenadModalComponent } from '../cenadModal/cenadModal.component';
import { Cenad } from '@interfaces/models/cenad';
import { OrquestadorService } from '@services/orquestadorService';
import { tap } from 'rxjs';

@Component({
  selector: 'app-cenad',
  imports: [CenadModalComponent],
  templateUrl: './cenad.component.html',
  styleUrls: ['./cenad.component.css']
})
export class CenadComponent  {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);

  // Recibimos el CENAD del padre
  cenad = input.required<Cenad>();

  // Señal para usuario administrador
  usuarioAdministrador = signal<any>(null);

  // Computed para mostrar nombre de provincia
  provincia = computed(() => {
    const idProvincia = this.cenad().provincia;
    const encontrada = this.utils.provincias().find(p => p.idProvincia === idProvincia);
    return encontrada ? encontrada.nombre : '';
  });

  private getUsuarioAdministrador = effect(() => {
    const c = this.cenad();
    if (!c) return;
      this.orquestadorService.loadUsuarioAdministradorCenad(c.idString).pipe(
            tap(res => {
              this.usuarioAdministrador.set(res);
            }),
  ).subscribe()});


/*
  ngOnInit() {
    this.fetchUsuarioAdministrador();
  }

  async fetchUsuarioAdministrador() {
    if (!this.cenad()) return;
    const usuario = await this.usuarioService.fetchUsuarioAdministradorDeCenad(this.cenad()?.idString);
    this.usuarioAdministrador.set(usuario);
  }

  actualizarCenadEnElemento() {
    // Puedes actualizar la señal si el modal cambia datos
    this.cenad.set({ ...this.cenad() });
  }
  */

// toTitleCase(str: string) {
  //  return str.replace(/\w\S*/g, txt =>
    //  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
   // );
 // }


}

