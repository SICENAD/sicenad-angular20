import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@stores/auth.store';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom } from 'rxjs';
import { UtilService } from '@services/utilService';
import { ApiService } from '@services/apiService';


@Component({
  selector: 'app-test-auth',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 border rounded bg-gray-100 space-y-3">
      <h2 class="text-lg font-bold">🔐 Test Auth + Utils + Files</h2>

      <!-- FORM LOGIN -->
      <div class="space-x-2">
        <input class="border p-1" type="text" [(ngModel)]="username" placeholder="Usuario">
        <input class="border p-1" type="password" [(ngModel)]="password" placeholder="Contraseña">
        <button class="bg-blue-500 text-white px-2 py-1 rounded"
                (click)="login()">Login</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded"
                (click)="logout()">Logout</button>
      </div>

      <!-- INFO USUARIO -->
      <div class="p-2 border rounded bg-white">
        <p><b>Usuario:</b> {{ user() }}</p>
        <p><b>Rol:</b> {{ role() }}</p>
        <p><b>Token:</b> {{ token() || '❌ No token' }}</p>
      </div>

      <!-- FETCH DE PRUEBA -->
      <div class="space-x-2">
        <button class="bg-green-500 text-white px-2 py-1 rounded"
                (click)="doFetch()">Fetch con Token</button>
      </div>

      <div class="p-2 border rounded bg-white">
        <b>Resultado fetch:</b>
        <pre class="whitespace-pre-wrap">{{ fetchResult() }}</pre>
      </div>

      <!-- UPLOAD / DELETE FILE -->
      <div class="space-x-2">
        <input type="file" (change)="onFileSelected($event)">
        <button class="bg-purple-500 text-white px-2 py-1 rounded"
                (click)="uploadFile()">Subir Archivo</button>
        <button class="bg-orange-500 text-white px-2 py-1 rounded"
                (click)="deleteFile()">Borrar Archivo</button>
        <button class="bg-red-600 text-white px-2 py-1 rounded"
                (click)="deleteFolder()">Borrar Carpeta</button>
      </div>

      <div class="p-2 border rounded bg-white">
        <b>Resultado archivo:</b>
        <pre class="whitespace-pre-wrap">{{ fileResult() }}</pre>
      </div>
    </div>
  `
})
export class LoginTestComponent {
  private auth = inject(AuthStore);
  private utils = inject(UtilsStore);
  private apiService: ApiService = inject(ApiService);
  private utilService = inject(UtilService);

  username = '';
  password = '';
  fetchResult = signal<string>('---');
  fileResult = signal<string>('---');
  selectedFile: File | null = null;

  // Signals públicos para template
  user = this.auth.username;
  role = this.auth.rol;
  token = this.auth.token;

  async ngOnInit() {
    await firstValueFrom(this.utils.cargarPropiedadesIniciales());
  }

  async login() {
    try {
      const success = await this.auth.login(this.username, this.password);
      success ? this.utilService.toast('✅ Login correcto', 'success') : this.utilService.toast('❌ Login fallido', 'error');

    } catch (err) {
      console.error('Error login:', err);
      alert('❌ Error login');
    }
  }

  async logout() {
    await this.auth.logout();
    this.utilService.toast('✅ Logout hecho', 'success')
  }

  async doFetch() {
    try {
      const url = `${this.utils.urlApi()}/cenads/1`;
      const response = await firstValueFrom(this.apiService.peticionConToken<any>(url, 'GET'));
      this.fetchResult.set(JSON.stringify(response, null, 2));
    } catch (err) {
      console.error('Error en fetch:', err);
      this.fetchResult.set('❌ Error en fetch: ' + JSON.stringify(err));
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] || null;
  }

  async uploadFile() {
    if (!this.selectedFile) {
      alert('Selecciona un archivo primero');
      return;
    }
    try {
      const url = `${this.utils.urlApi()}/upload`; // Ajusta endpoint
      const nombreArchivo = await firstValueFrom(this.apiService.subirArchivo(url, this.selectedFile));
      this.fileResult.set(`Archivo subido: ${nombreArchivo}`);
    } catch (err) {
      console.error('Error upload:', err);
      this.fileResult.set('❌ Error upload: ' + JSON.stringify(err));
    }
  }

  async deleteFile() {
    try {
      const url = `${this.utils.urlApi()}/delete/file.txt`; // Ajusta endpoint
      const res = await firstValueFrom(this.apiService.borrarArchivo(url));
      this.fileResult.set(`Archivo borrado: ${JSON.stringify(res)}`);
    } catch (err) {
      console.error('Error delete file:', err);
      this.fileResult.set('❌ Error delete file: ' + JSON.stringify(err));
    }
  }

  async deleteFolder() {
    try {
      const url = `${this.utils.urlApi()}/delete/folder`; // Ajusta endpoint
      const res = await firstValueFrom(this.apiService.borrarCarpeta(url));
      this.fileResult.set(`Carpeta borrada: ${JSON.stringify(res)}`);
    } catch (err) {
      console.error('Error delete folder:', err);
      this.fileResult.set('❌ Error delete folder: ' + JSON.stringify(err));
    }
  }
}



