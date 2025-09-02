import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared/components/core/footer/footer.component';
import { HeaderComponent } from '@shared/components/core/header/header.component';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('sicenad-angular20');
  private utils = inject(UtilsStore);

  async ngOnInit() {
    await firstValueFrom(this.utils.cargarPropiedadesIniciales());
  }
}
