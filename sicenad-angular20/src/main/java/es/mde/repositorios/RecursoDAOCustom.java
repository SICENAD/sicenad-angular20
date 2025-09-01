package es.mde.repositorios;

import java.util.List;
import es.mde.entidades.CategoriaFichero;

/**
 * Representa la interfaz con los metodos personalizados de recursos
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public interface RecursoDAOCustom {
	/**
	 * Devuelve una lista de las categorias de ficheros que tienen los ficheros de un recurso
	 * @param id Id del recurso
	 * @return Devuelve una lista de las categorias de ficheros que tienen los ficheros de un recurso
	 */
	List<CategoriaFichero> getCategoriasFicheroDeRecurso(Long id);
}