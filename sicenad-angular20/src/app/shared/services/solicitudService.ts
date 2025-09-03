import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Solicitud } from "@interfaces/models/solicitud";

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private apiService = inject(ApiService);

  private solicitudes: Solicitud[] = [];
  private solicitud: Solicitud | null = null;

  getSolicitudes(): Solicitud[] {
    return this.solicitudes;
  }
  getSolicitud(): Solicitud | null {
    return this.solicitud;
  }

  getAll(idCenad: string): Observable<Solicitud[]> {
    const endpoint = `/cenads/${idCenad}/solicitudes?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { solicitudes: Solicitud[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.solicitudes.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
