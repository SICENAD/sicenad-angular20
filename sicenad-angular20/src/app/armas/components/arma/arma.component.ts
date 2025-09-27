import { Component, input } from '@angular/core';
import { ArmaModalComponent } from '../armaModal/armaModal.component';
import { Arma } from '@interfaces/models/arma';

@Component({
  selector: 'app-arma',
  imports: [ArmaModalComponent],
  templateUrl: './arma.component.html',
  styleUrls: ['./arma.component.css']
})
export class ArmaComponent {
    arma = input.required<Arma>();
}