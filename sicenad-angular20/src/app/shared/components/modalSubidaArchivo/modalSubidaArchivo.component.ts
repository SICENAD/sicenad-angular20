import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalSubidaService } from '@services/modalSubidaArchivo.service';
import { ModalState } from '@interfaces/others/modalState';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [TranslateModule],
  selector: 'app-modalSubidaArchivo',
  templateUrl: './modalSubidaArchivo.component.html',
  styleUrls: ['./modalSubidaArchivo.component.css']
})
export class ModalSubidaArchivoComponent implements OnDestroy {
  state: ModalState | null = null;
  private sub: Subscription;
  constructor(private svc: ModalSubidaService) {
    this.sub = this.svc.asObservable().subscribe((arr) => {
      if (!arr || arr.length === 0) {
        this.state = null;
        return;
      }
      // Mostrar el primero (el flujo actual usa un modal a la vez)
      this.state = arr[0];
    });
  }
  close() {
    if (!this.state) return;
    this.svc.close(this.state.key);
  }
  ngOnDestroy(): void {
    try { this.sub.unsubscribe(); } catch (e) {}
  }
}
