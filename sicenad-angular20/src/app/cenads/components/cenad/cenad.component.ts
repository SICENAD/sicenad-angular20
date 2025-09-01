import { Component, input } from '@angular/core';
import { Cenad } from '@interfaces/models/cenad';

@Component({
  selector: 'app-cenad',
  imports: [],
  templateUrl: './cenad.component.html',
  styleUrls: ['./cenad.component.css'],
})
export class CenadComponent {
  cenad = input<Cenad>();
 }
