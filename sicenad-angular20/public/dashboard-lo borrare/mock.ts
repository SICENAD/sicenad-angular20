import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@stores/auth.store';
import { UtilsStore } from '@stores/utils.store';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-test-mock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 border rounded bg-gray-100 space-y-3">
      <h2>🧪 Test Mocks: Auth + Utils + Files</h2>

      <div class="space-x-2">
        <input type="text" [(ngModel)]="username" placeholder="Usuario" class="border p-1">
        <input type="password" [(ngModel)]="password" placeholder="Contraseña" class="border p-1">
        <button (click)="login()" class="bg-blue-500 text-white px-2 py-1 rounded">Login</button>
        <button (click)="logout()" class="bg-red-500 text-white px-2 py-1 rounded">Logout</button>
      </div>

      <div class="p-2 border rounded bg-white">
        <p><b>Usuario:</b> {{ user() }}</p>
        <p><b>Rol:</b> {{ role() }}</p>
        <p><b>Token:</b> {{ token() || '❌ No token' }}</p>
      </div>

      <div class="space-x-2">
        <button (click)="doFetch()" class="bg-green-500 text-white px-2 py-1 rounded">Fetch Mock</button>
      </div>

      <div class="p-2 border rounded bg-white">
        <b>Resultado fetch:</b>
        <pre>{{ fetchResult() }}</pre>
      </div>

      <div class="space-x-2">
        <input type="file" (change)="onFileSelected($event)">
        <button (click)="uploadFile()" class="bg-purple-500 text-white px-2 py-1 rounded">Subir Archivo</button>
        <button (click)="deleteFile()" class="bg-orange-500 text-white px-2 py-1 rounded">Borrar Archivo</button>
        <button (click)="deleteFolder()" class="bg-red-600 text-white px-2 py-1 rounded">Borrar Carpeta</button>
      </div>

      <div class="p-2 border rounded bg-white">
        <b>Resultado archivo:</b>
        <pre>{{ fileResult() }}</pre>
      </div>
    </div>
  `
})
export class TestMockComponent {
  private auth = inject(AuthStore);
  private utils = inject(UtilsStore);

  username = '';
  password = '';
  selectedFile: File | null = null;

  fetchResult = signal<string>('---');
  fileResult = signal<string>('---');

  user = this.auth.username;
  role = this.auth.rol;
  token = this.auth.token;

  async ngOnInit() {
    // Mock carga de properties
    this.utils.properties.set({
      urlApi: 'https://mock-api.local',
    });
  }

  async login() {
    // Mock login: siempre retorna token/usuario/rol
    const mockResponse = { token: 'mock-token', username: this.username || 'user1', rol: 'Admin' };
    this.auth['_token'].set(mockResponse.token);
    this.auth['_username'].set(mockResponse.username);
    this.auth['_rol'].set(mockResponse.rol);

    sessionStorage.setItem('token', mockResponse.token);
    sessionStorage.setItem('username', mockResponse.username);
    sessionStorage.setItem('rol', mockResponse.rol);

    alert('✅ Login mock completado');
  }

  async logout() {
    this.auth['_token'].set(null);
    this.auth['_username'].set(null);
    this.auth['_rol'].set(null);
    sessionStorage.clear();
    alert('🚪 Logout mock completado');
  }

  async doFetch() {
    // Mock fetch con delay
    of({ data: 'Respuesta de prueba', timestamp: new Date().toISOString() })
      .pipe(delay(500))
      .subscribe(res => this.fetchResult.set(JSON.stringify(res, null, 2)));
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] || null;
  }

  async uploadFile() {
    if (!this.selectedFile) return alert('Selecciona un archivo primero');
    // Mock upload
    of({ nombreArchivo: this.selectedFile.name }).pipe(delay(500)).subscribe(res => {
      this.fileResult.set(`Archivo subido mock: ${res.nombreArchivo}`);
    });
  }

  async deleteFile() {
    // Mock delete file
    of({ mensaje: 'Archivo borrado mock' }).pipe(delay(300)).subscribe(res => {
      this.fileResult.set(JSON.stringify(res));
    });
  }

  async deleteFolder() {
    // Mock delete folder
    of({ mensaje: 'Carpeta borrada mock' }).pipe(delay(300)).subscribe(res => {
      this.fileResult.set(JSON.stringify(res));
    });
  }
}
