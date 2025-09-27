package es.mde.repositorios;

import java.util.List;
import es.mde.entidades.CategoriaFichero;
import es.mde.entidades.SolicitudRecurso;

/**
 * Representa la interfaz con los metodos personalizados de recursos
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public interface RecursoDAOCustom {
	/**
	 * Devuelve una lista de las categorias de ficheros que tienen los ficheros de
	 * un recurso
	 * 
	 * @param id Id del recurso
	 * @return Devuelve una lista de las categorias de ficheros que tienen los
	 *         ficheros de un recurso
	 */
	List<CategoriaFichero> getCategoriasFicheroDeRecurso(Long id);

	/**
	 * Devuelve una lista de las solicitudes de un recurso que tienen ese estado
	 * 
	 * @param id Id del recurso
	 * @param estado Estado de la solicitud
	 * @return Devuelve una lista de las solicitudes de un recurso que tienen ese estado
	 */
	List<SolicitudRecurso> getSolicitudesDeRecursoPorEstado(Long id, String estado);
}