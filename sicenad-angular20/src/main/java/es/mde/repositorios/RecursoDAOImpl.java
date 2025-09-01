package es.mde.repositorios;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import es.mde.entidades.CategoriaFichero;
import es.mde.entidades.Fichero;

/**
 * Representa la clase implementada con los metodos personalizados de los recursos 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Transactional(readOnly = true)
public class RecursoDAOImpl implements RecursoDAOCustom {
	@Autowired
	RecursoDAO recursoDAO;

	@PersistenceContext
	EntityManager entityManager;
	
	@Override
	/**
	 * Devuelve una lista de las categorias de ficheros que tienen los ficheros de un recurso
	 * @param id Id del recurso
	 */
	public List<CategoriaFichero> getCategoriasFicheroDeRecurso(Long id) {

		List<CategoriaFichero> categoriasFichero = new ArrayList<CategoriaFichero>();

		List<Fichero> ficheros = recursoDAO.findById(id).get().getFicheros().stream().collect(Collectors.toList());

		for (Fichero fichero : ficheros) {
			if (!categoriasFichero.contains(fichero.getCategoriaFichero())) {
				categoriasFichero.add(fichero.getCategoriaFichero());
			}
		}
		return categoriasFichero;
	}
}