import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '@stores/auth.store';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@services/apiService';

@Component({
  selector: 'app-test-store',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="utils.properties(); else loading" style="padding:1rem; border:1px solid #ccc;">
      <h2>Test Auth & Utils Store</h2>

      <h3>Properties JSON:</h3>
      <pre>{{ utils.properties() | json }}</pre>

      <h3>Auth Status:</h3>
      <p>Token: {{ auth.token() }}</p>
      <p>Username: {{ auth.username() }}</p>
      <p>Role: {{ auth.rol() }}</p>
      <p>Authenticated: {{ auth.isAuthenticated() }}</p>

      <button (click)="doLogin()">Login Fake</button>
      <button (click)="doLogout()">Logout</button>

      <h3>Fetch Example:</h3>
      <button (click)="testFetch()">Fetch /api/test</button>
      <pre>{{ fetchResult | json }}</pre>
    </div>

    <ng-template #loading>
      <p>Cargando properties...</p>
    </ng-template>
  `,
})
export class TestStoreComponent implements OnInit {
  auth = inject(AuthStore);
  utils = inject(UtilsStore);
  apiService = inject(ApiService)

  fetchResult: any = null;

  async ngOnInit() {
    try {
      // Cargar properties desde public/properties.json
      await firstValueFrom(this.utils.cargarPropiedadesIniciales());
    } catch (err) {
      console.error('Error cargando properties:', err);
    }
  }

  async doLogin() {
    const success = await this.auth.login('user1', 'password');
    alert(success ? 'Login correcto' : 'Login fallido');
  }

  async doLogout() {
    await this.auth.logout();
    alert('Logout realizado');
  }

  async testFetch() {
    try {
      const url = `${this.utils.urlApi()}/test`; // tu endpoint de prueba
      const response = await firstValueFrom(this.apiService.peticionConToken(url, 'GET'));
      this.fetchResult = response;
    } catch (err) {
      console.error('Error en fetch:', err);
      this.fetchResult = '❌ Error en fetch';
    }
  }
}

