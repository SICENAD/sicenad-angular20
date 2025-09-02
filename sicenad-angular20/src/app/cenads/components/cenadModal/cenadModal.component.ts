import { Component, input } from '@angular/core';
import { Cenad } from '@interfaces/models/cenad';

@Component({
  selector: 'app-cenad-modal',
  imports: [],
  templateUrl: './cenadModal.component.html',
  styleUrls: ['./cenadModal.component.css'],
})
export class CenadModalComponent {
    cenad = input<Cenad>();

 }
