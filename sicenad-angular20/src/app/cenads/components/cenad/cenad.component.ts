// cenad.component.ts
import { Component, input, signal, computed, inject, effect } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { CenadModalComponent } from '../cenadModal/cenadModal.component';
import { Cenad } from '@interfaces/models/cenad';
import { OrquestadorService } from '@services/orquestadorService';
import { tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cenad',
  imports: [CenadModalComponent, TranslateModule],
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
}

