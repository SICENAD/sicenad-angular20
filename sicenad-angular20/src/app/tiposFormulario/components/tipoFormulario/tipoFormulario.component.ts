import { Component, input } from '@angular/core';
import { TipoformularioModalComponent } from '../tipoFormularioModal/tipoFormularioModal.component';
import { TipoFormulario } from '@interfaces/models/tipoFormulario';

@Component({
  selector: 'app-tipoFormulario',
  imports: [TipoformularioModalComponent],
  templateUrl: './tipoFormulario.component.html',
  styleUrls: ['./tipoFormulario.component.css']
})
export class TipoFormularioComponent {

    tipoFormulario = input.required<TipoFormulario>();
}
