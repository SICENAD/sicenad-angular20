package es.mde.notificaciones;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import es.mde.entidades.SolicitudRecurso;
import es.mde.repositorios.SolicitudRecursoDAO;
import es.mde.servicios.MailService;

/**
 * Genera las notificaciones
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Configuration
public class Notificar {

	private static SolicitudRecursoDAO solicitudRecursoDAO;
	private static MailService mail;

	/**
	 * Metodo que inicia la clase
	 * @param mail Interfaz estatica encargada de enviar el email
	 * @param solicitudRecursoDAO Interfaz estatica que  recorre la BD de solicitudes
	 */
	@Autowired
	public void init(MailService mail, SolicitudRecursoDAO solicitudRecursoDAO) {
		Notificar.solicitudRecursoDAO = solicitudRecursoDAO;
		Notificar.mail = mail;
	}

	/**
	 * Metodo que envía la notificación cuando cambia el estado de una solicitud
	 * @param id Id de la solicitud
	 * @return Devuelve un DTO de la solicitud
	 */
	public static SolicitudDTO enviarNotificacion(Long id) {

		SolicitudRecurso solicitudRecurso = solicitudRecursoDAO.findById(id).get();
		SolicitudDTO solicitudDTO = new SolicitudDTO(solicitudRecurso);
		try {
			if (solicitudDTO.notificarAdministrador) {
				String b = mail.enviarNotificacion(solicitudDTO.administrador, solicitudDTO.subject,
						"Buenos días,<br><br> El estado de la solicitud de la unidad " 
						+ solicitudDTO.unidad + " del recurso " + solicitudDTO.recurso + " (" 
						+ solicitudDTO.periodo + ") ha cambiado a <b>" + solicitudDTO.estado.toUpperCase() + "</b>.");
				System.err.println(b + " a " + solicitudDTO.administrador);
			}
			if (solicitudDTO.notificarGestor) {
				String c = mail.enviarNotificacion(solicitudDTO.gestor, solicitudDTO.subject,
						"Buenos días,<br><br> El estado de la solicitud de la unidad " 
						+ solicitudDTO.unidad + " del recurso " + solicitudDTO.recurso 
						+ " (" + solicitudDTO.periodo + ") ha cambiado a <b>" + solicitudDTO.estado.toUpperCase() + "</b>.");
				System.err.println(c + " a " + solicitudDTO.gestor);
			}		
			if (solicitudDTO.notificarNormal) {
				String d = mail.enviarNotificacion(solicitudDTO.normal, solicitudDTO.subject,
						"Buenos días,<br><br> El estado de la solicitud del recurso " 
						+ solicitudDTO.recurso + "del CENAD/CMT " + solicitudDTO.cenad
						+ " (" + solicitudDTO.periodo + ") ha cambiado a <b>" + solicitudDTO.estado.toUpperCase() + "</b>.");
				System.err.println(d + " a " + solicitudDTO.normal);
			}	
		} catch (Exception e) {
			e.printStackTrace();
		}
		return solicitudDTO;
	}
}