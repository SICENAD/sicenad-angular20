import { Injectable, Signal, computed, inject } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { Subscription, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private utils = inject(UtilsStore);
  private readonly defaultTtl = 2 * 60 * 1000; // 2 minutos por defecto
  private readonly expiryKey = 'horaExpiracionLocalStorage';
  private expirySub: Subscription | null = null;
  private onExpireCallback: (() => void) | null = null;

  constructor() {
    // Inicializa la hora de expiración si no existe
    const storedExpiry = localStorage.getItem(this.expiryKey);
    if (storedExpiry) {
      const expiryMs = new Date(storedExpiry).getTime();
      this.scheduleExpiryCheck(expiryMs);
    } else {
      this.resetExpiry();
    }
  }

  // Calcula TTL dinámicamente
  private getTtl(): number {
    const minutos = this.utils.minutosExpiracionLocalStorage();
    return minutos ? minutos * 60 * 1000 : this.defaultTtl;
  }

  // --- CONFIGURAR CALLBACK GLOBAL (p.ej., logout) ---
  setOnExpire(callback: () => void) {
    this.onExpireCallback = callback;
  }

  // --- RENOVAR TTL ---
  resetExpiry(): void {
    const ttl = this.getTtl();
    const newExpiry = Date.now() + ttl;
    localStorage.setItem(this.expiryKey, new Date(newExpiry).toISOString());
    this.scheduleExpiryCheck(newExpiry);
    console.log('TTL usado (ms):', ttl);
  }

  private scheduleExpiryCheck(expiryTimestamp: number) {
    this.expirySub?.unsubscribe();
    const msUntilExpiry = Math.max(expiryTimestamp - Date.now(), 0);
    this.expirySub = timer(msUntilExpiry).subscribe(() => {
      this.clear();
      if (this.onExpireCallback) this.onExpireCallback();
    });
  }

  // --- MÉTODOS CRUD ---
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    this.resetExpiry(); // renueva TTL en cada escritura
  }

  getItem<T>(key: string): T | null {
    const expiryStr = localStorage.getItem(this.expiryKey);
    // Si no hay hora de expiración, limpiar y salir
    if (!expiryStr) {
      this.clear();
      return null;
    }
    const expiry = new Date(expiryStr).getTime();
    if (Date.now() > expiry) {
      // Ha caducado, limpiar y avisar
      this.clear();
      if (this.onExpireCallback) this.onExpireCallback();
      return null;
    }
    // Intentar parsear el valor
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    try {
      const value = JSON.parse(itemStr) as T;
      this.resetExpiry(); // renueva TTL en cada lectura
      return value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
    this.expirySub?.unsubscribe();
  }

  getExpiryTime(): string | null {
    return localStorage.getItem(this.expiryKey);
  }

  // --- NUEVO: AUTO-RENOVAR TTL CUANDO LEES UN SIGNAL ---
  computedAntiExpiracionLocalStorage<T>(signal: Signal<T>): Signal<T> {
    return computed(() => {
      const value = signal();
      this.resetExpiry(); // cada lectura renueva la expiración
      return value;
    });
  }
}
