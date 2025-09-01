package es.mde.repositorios;

import java.util.List;
import es.mde.entidades.Categoria;
import es.mde.entidades.Recurso;

/**
 * Representa la interfaz con los metodos personalizados de categorias
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public interface CategoriaDAOCustom {
	/**
	 * Devuelve una lista de subcategorias anidadas de una categoria
	 * @param id Id de la categoria
	 * @return Devuelve una lista de subcategorias anidadas de una categoria
	 */
	List<Categoria> getSubcategoriasAnidadas(Long id);
	/**
	 * Devuelve una lista de categorias padre de una categoria
	 * @return Devuelve una lista de categorias padre de una categoria
	 */
	List<Categoria> getCategoriasPadre();
	/**
	 * Devuelve una lista de recursos de las subcategorias anidadas de una categoria
	 * @param id Id de la categoria
	 * @return Devuelve una lista de recursos de las subcategorias anidadas de una categoria
	 */
	List<Recurso> getRecursosDeSubcategorias(Long id);
}