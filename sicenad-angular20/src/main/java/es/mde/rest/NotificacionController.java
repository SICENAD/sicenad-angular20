package es.mde.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.mde.notificaciones.Notificar;
import es.mde.notificaciones.SolicitudDTO;

/**
 * Controlador encargado del envio de notificaciones
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RestController
//@RequestMapping(path = "/api/notificar")
public class NotificacionController {
	
	@GetMapping("/api/notificar/{id}")
	public SolicitudDTO enviarNotificacion(@PathVariable Long id) {
		
		SolicitudDTO solicitudDTO = Notificar.enviarNotificacion(id);
				
		return solicitudDTO;
		
	}
	
	
	
	
	
//	public CollectionModel<PersistentEntityResource> generarFacturas(@PathVariable Long id,
//			PersistentEntityResourceAssembler assembler) {
//
//		List<PrestacionConId> prestaciones = Descargar.generarFacturas(id);
//		
//		return assembler.toCollectionModel(prestaciones);
//	}
		
		
	
}
