package es.mde.repositorios;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import es.mde.entidades.Categoria;
import es.mde.entidades.Recurso;

/**
 * Representa la clase implementada con los metodos personalizados de las categorias 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Transactional(readOnly = true)
public class CategoriaDAOImpl implements CategoriaDAOCustom {
	@Autowired
	CategoriaDAO categoriaDAO;

	@PersistenceContext
	EntityManager entityManager;
	
	/**
	 * Devuelve una lista de categorias padre de una categoria
	 * @return Devuelve una lista de categorias padre de una categoria
	 */
	@Override 
	public List<Categoria> getCategoriasPadre() {
		List<Categoria> categorias = categoriaDAO.findAll().stream()
				.filter(j -> j.getCategoriaPadre() == null).collect(Collectors.toList());
		return categorias;
	}

	/**
	 * Devuelve una lista de recursos de las subcategorias anidadas de una categoria
	 * @param id Id de la categoria
	 * @return Devuelve una lista de recursos de las subcategorias anidadas de una categoria
	 */
	@Override 
	public List<Recurso> getRecursosDeSubcategorias(Long id) {
		List<Recurso> recursosTotales = new ArrayList<Recurso>();
		Categoria categoria = categoriaDAO.findById(id).get();
		getSubcategoriasAnidadas(id).forEach(c -> recursosTotales.addAll(c.getRecursos()));
		recursosTotales.addAll(categoria.getRecursos());		
		return recursosTotales;
	}

	/**
	 * Devuelve una lista de subcategorias anidadas de una categoria
	 * @param id Id de la categoria
	 * @return Devuelve una lista de subcategorias anidadas de una categoria
	 */
	@Override 
	public List<Categoria> getSubcategoriasAnidadas(Long id) {
		List<Categoria> categorias = categoriaDAO.findById(id).get().getSubcategorias().stream().collect(Collectors.toList());
		List<Categoria> categoriasAnidadas = new ArrayList<Categoria>();
		categoriasAnidadas.addAll(categorias);
		categorias.forEach(c -> { 
			if (c.getSubcategorias().size() != 0) {
				categoriasAnidadas.addAll(getSubcategoriasAnidadas(c.getId()));
			}
		});
		return categoriasAnidadas;
	}
}