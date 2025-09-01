package es.mde.repositorios;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import es.mde.entidades.SolicitudRecurso;

/**
 * Representa la interfaz que expone para la API las solicitudes 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="solicitudes", collectionResourceRel="solicitudes", itemResourceRel="solicitud") 
public interface SolicitudRecursoDAO extends JpaRepository<SolicitudRecurso, Long> {
	
	/**
	 * Devuelve una lista de solicitudes cuya fecha de inicio es posterior a la seleccionada
	 * @param fechaInicioRecurso Fecha de inicio a partir de la cual se buscan solicitudes
	 * @return Devuelve una lista de solicitudes cuya fecha de inicio es posterior a la seleccionada
	 */
	@RestResource(path="fechaInicioRecursoPosterior")
	List<SolicitudRecurso> findByfechaHoraInicioRecursoAfter(@Param("fecha") Date fechaInicioRecurso);
	
	/**
	 * Devuelve una lista de solicitudes cuya fecha de solicitud es posterior a la seleccionada
	 * @param fechaSolicitud Fecha de solicitud a partir de la cual se buscan solicitudes
	 * @return Devuelve una lista de solicitudes cuya fecha de solicitud es posterior a la seleccionada
	 */
	@RestResource(path="fechaSolicitudPosterior")
	List<SolicitudRecurso> findByfechaSolicitudAfter(@Param("fechaSolicitud") Date fechaSolicitud);
	
	/**
	 * Devuelve una lista de solicitudes que se encuentran entre las fechas seleccionadas
	 * @param fechaSolicitudDesde Fecha de inicio de la busqueda de solicitudes
	 * @param fechaSolicitudHasta Fecha de fin de la busqueda de solicitudes
	 * @return Devuelve una lista de solicitudes que se encuentran entre las fechas seleccionadas
	 */
	@RestResource(path="fechaSolicitudesEntreDosFechas")
	List<SolicitudRecurso> findAllByfechaSolicitudBetween(@Param("fechaInicio") Date fechaSolicitudDesde, @Param("fechaFin") Date fechaSolicitudHasta);	
	
	/**
	 * Devuelve una lista de solicitudes que inician entre las fechas seleccionadas
	 * @param fechaInicioRecursoDesde Fecha de inicio de la busqueda de solicitudes
	 * @param fechaInicioRecursoHasta Fecha de fin de la busqueda de solicitudes
	 * @return Devuelve una lista de solicitudes que inician entre las fechas seleccionadas
	 */
	@RestResource(path="fechaInicioRecursoEntreDosFechas")
	List<SolicitudRecurso> findAllByfechaHoraInicioRecursoBetween(@Param("fechaInicio") Date fechaInicioRecursoDesde, @Param("fechaFin") Date fechaInicioRecursoHasta);	
}
