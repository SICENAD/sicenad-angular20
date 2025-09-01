package es.mde.notificaciones;

import java.util.Calendar;
import java.util.Date;

import es.mde.entidades.SolicitudRecurso;

/**
 * Representa un DTO con los datos necesarios de la solicitud para las notificaciones, simplificados a String
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public class SolicitudDTO {
	/**
	 * Campos String de los emails de los usuarios, nombres de unidad, recurso y cenad, periodo de la solicitud, estado de la misma y subject del email
	 */
	public String administrador, gestor, normal, unidad, recurso, estado, periodo, subject, cenad;
	/**
	 * Campos boolean que indican si el usuario tiene que recibir la notificacion o no
	 */
	public boolean notificarAdministrador, notificarGestor, notificarNormal;
	
	/**
	 * Creau un DTO de SolicitudRecurso
	 */
	public SolicitudDTO() {}
	
	/**
	 * Creau un DTO de SolicitudRecurso
	 */
	public SolicitudDTO(SolicitudRecurso solicitudRecurso) {
		super();
		String[] meses = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};
		this.administrador = solicitudRecurso.getRecurso().getCategoria().getCenad().getUsuarioAdministrador()
				.getEmail();
		this.notificarAdministrador = solicitudRecurso.getRecurso().getCategoria().getCenad()
				.getUsuarioAdministrador().isEmailAdmitido();
		this.gestor = solicitudRecurso.getRecurso().getUsuarioGestor().getEmail();
		this.notificarGestor = solicitudRecurso.getRecurso().getUsuarioGestor().isEmailAdmitido();
		this.normal = solicitudRecurso.getUsuarioNormal().getEmail();
		this.notificarNormal = solicitudRecurso.getUsuarioNormal().isEmailAdmitido();
		this.recurso = solicitudRecurso.getRecurso().getNombre();
		this.periodo = toCalendar(solicitudRecurso.getFechaHoraInicioRecurso()).get(Calendar.DAY_OF_MONTH)
				+ meses[toCalendar(solicitudRecurso.getFechaHoraInicioRecurso()).get(Calendar.MONTH)].toUpperCase()
				+ toCalendar(solicitudRecurso.getFechaHoraInicioRecurso()).get(Calendar.YEAR) + " - "
				+ toCalendar(solicitudRecurso.getFechaHoraFinRecurso()).get(Calendar.DAY_OF_MONTH)
				+ meses[toCalendar(solicitudRecurso.getFechaHoraFinRecurso()).get(Calendar.MONTH)].toUpperCase()
				+ toCalendar(solicitudRecurso.getFechaHoraFinRecurso()).get(Calendar.YEAR);
		this.subject = "Solicitud de la unidad " + solicitudRecurso.getUsuarioNormal().getUnidad().getNombre()
				+ " del recurso " + recurso + "del CENAD/CMT "
				+ solicitudRecurso.getRecurso().getCategoria().getCenad().getNombre() + " (" + periodo + ")";
		this.estado = solicitudRecurso.getEstado();
		this.cenad = solicitudRecurso.getRecurso().getCategoria().getCenad().getNombre();
		this.unidad = solicitudRecurso.getUnidadUsuaria();
	}
	
	/**
	 * Metodo que transforma un Date en un Calendar para no usar metodos deprecated 
	 * @param date Objeto Date que contiene las fechas
	 * @return Devuelve el Calendar equivalente al Date introducido
	 */
	public static Calendar toCalendar(Date date){ 
		  Calendar cal = Calendar.getInstance();
		  cal.setTime(date);
		  return cal;
	}
}