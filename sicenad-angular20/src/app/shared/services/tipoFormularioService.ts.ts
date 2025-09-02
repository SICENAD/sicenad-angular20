import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { TipoFormulario } from "@interfaces/models/tipoFormulario";

@Injectable({ providedIn: 'root' })
export class TipoFormularioService {
  private apiService = inject(ApiService);

  private tiposFormulario: TipoFormulario[] = [];
  private tipoFormulario: TipoFormulario | null = null;

  getTiposFormulario(): TipoFormulario[] {
    return this.tiposFormulario;
  }
  getTipoFormulario(): TipoFormulario | null {
    return this.tipoFormulario;
  }

  getAll(): Observable<TipoFormulario[]> {
    const url = `${this.apiService.getUrlApi()}/tipos_formulario?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { tipos_formulario: TipoFormulario[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.tipos_formulario.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
