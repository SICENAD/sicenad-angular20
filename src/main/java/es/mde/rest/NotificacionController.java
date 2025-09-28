package es.mde.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import es.mde.models.EmailRequest;
import es.mde.notificaciones.Notificar;
import es.mde.notificaciones.SolicitudDTO;
import es.mde.servicios.MailService;
import jakarta.mail.MessagingException;

/**
 * Controlador encargado del envio de notificaciones
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RestController
public class NotificacionController {
	
	private MailService mailService; 
	
	public NotificacionController (MailService mailService) {
		this.mailService = mailService;
	}
	
	@GetMapping("/api/notificar/{id}")
	public SolicitudDTO enviarNotificacion(@PathVariable Long id) {
		
		SolicitudDTO solicitudDTO = Notificar.enviarNotificacion(id);
				
		return solicitudDTO;
		
	}
	
	@PostMapping("/api/notificar")
    @ResponseBody
    public ResponseEntity<String> enviarEmail(@RequestBody EmailRequest emailRequest) throws MessagingException {
        return ResponseEntity.ok(mailService.enviarNotificacion(emailRequest.getTo(), emailRequest.getSubject(), emailRequest.getBody()));
    }
		
		
		
		

	
	
	
//	public CollectionModel<PersistentEntityResource> generarFacturas(@PathVariable Long id,
//			PersistentEntityResourceAssembler assembler) {
//
//		List<PrestacionConId> prestaciones = Descargar.generarFacturas(id);
//		
//		return assembler.toCollectionModel(prestaciones);
//	}
		
		
	
}
