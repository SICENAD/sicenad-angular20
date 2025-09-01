import { Component, inject } from '@angular/core';
import { UserStore } from '../shared/stores/user.store';
import { CounterStore } from '../shared/stores/counter.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports:[CommonModule],
  template: `
    <div *ngIf="user.isLoggedIn(); else loginForm">
      <h2>Bienvenido {{ user.user()?.name }} 🎉</h2>
      <button (click)="user.logout()">Cerrar sesión</button>

      <h3>Counter: {{ counter.count() }}</h3>
      <button (click)="counter.increment()">+</button>
      <button (click)="counter.decrement()">-</button>
      <button (click)="counter.reset()">Reset</button>
    </div>

    <ng-template #loginForm>
      <h2>Inicia sesión</h2>
      <button (click)="user.login('Alice')">Entrar como Alice</button>
      <button (click)="user.login('Bob')">Entrar como Bob</button>
    </ng-template>
  `
})
export class DashboardComponent {
  user = inject(UserStore);
  counter = inject(CounterStore);
}

