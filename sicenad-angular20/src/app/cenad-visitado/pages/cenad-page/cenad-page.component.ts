import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CenadHeaderComponent } from '@app/cenad-visitado/components/cenad-header/cenad-header.component';

@Component({
  selector: 'app-cenad-page',
  imports: [RouterOutlet, CenadHeaderComponent],
  templateUrl: './cenad-page.component.html'
})
export class CenadPageComponent {

}
