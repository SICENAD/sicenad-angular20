import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CenadService } from '@services/cenadService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-cenad-home',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './cenad-home.component.html',
  styleUrls: ['./cenad-home.component.css']
})
export class CenadHomeComponent {

  private route = inject(ActivatedRoute);
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private cenadService = inject(CenadService);
  readonly routesPaths = RoutesPaths;

  idCenad = computed(() => this.route.snapshot.params['idCenad']);
  escudoCenad = computed(() => this.cenadStore.cenadVisitado()?.escudo);
  pathImg = signal<string>('');

  // Iconos
  faEnlace = this.iconoStore.faEnlace;
  faCalendario = this.iconoStore.faCalendario;
  faRecurso = this.iconoStore.faRecurso;
  faCartografia = this.iconoStore.faCartografia;
  faSolicitar = this.iconoStore.faSolicitar;

  private esperarYCargarEscudo = void effect(() => {
    const escudo = this.escudoCenad();
    if (!escudo) return;
    this.cenadService.getEscudo(escudo, this.idCenad()).subscribe({
      next: blob => this.pathImg.set(URL.createObjectURL(blob)),
      error: err => console.error('Error cargando escudo', err)
    });
  });

  get esSuperAdmin() {
    return this.auth.rol() === 'Superadministrador';
  }

}
