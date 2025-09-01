import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CounterStore {
  private _count = signal(0);

  count = computed(() => this._count());

  constructor() {
    // 🔹 Recuperar estado inicial
    const savedCount = localStorage.getItem('count');
    if (savedCount) {
      this._count.set(Number(savedCount));
    }

    // 🔹 Guardar automáticamente en localStorage
    effect(() => {
      localStorage.setItem('count', String(this._count()));
    });
  }

  increment() {
    this._count.update(c => c + 1);
  }

  decrement() {
    this._count.update(c => c - 1);
  }

  reset() {
    this._count.set(0);
  }
}
