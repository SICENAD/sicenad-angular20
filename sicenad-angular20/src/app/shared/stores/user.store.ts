import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private _user = signal<{ id: number; name: string } | null>(null);

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());//!! convierte this._auth en un boolean, en true si hay alguien loggeado, o en false si nadie esta logueado "null"

  constructor() {
    // 🔹 Recuperar estado inicial desde localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this._user.set(JSON.parse(savedUser));
    }

    // 🔹 Guardar en localStorage cuando cambie el estado
    effect(() => {
      const current = this._user();
      if (current) {
        localStorage.setItem('user', JSON.stringify(current));
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  login(name: string) {
    this._user.set({ id: Date.now(), name });
  }

  logout() {
    this._user.set(null);
  }
}
