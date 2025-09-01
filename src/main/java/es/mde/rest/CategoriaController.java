package es.mde.rest;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.CollectionModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import es.mde.entidades.Categoria;
import es.mde.entidades.Recurso;
import es.mde.repositorios.CategoriaDAO;

/**
 * Controlador que maneja los metodos personalizados de las categorias
 */
@RepositoryRestController
//@RequestMapping(path = "/categorias")
@Configuration
public class CategoriaController {
	private CategoriaDAO categoriaDAO;

	/**
	 * Controlador para ejecutar los metodos personalizados
	 * @param categoriaDAO DAO de categoria
	 */
	public CategoriaController(CategoriaDAO categoriaDAO) {
		this.categoriaDAO = categoriaDAO;
	}
	
	/**
	 * Metodo que agrupa las subcategorias anidadas de una categoria
	 * @param id Id de la categoria
	 * @param assembler
	 * @return Lista de subcategorias anidadas
	 */
	@GetMapping("/categorias/{id}/subcategoriasAnidadas")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getSubcategoriasAnidadas(@PathVariable Long id,
			PersistentEntityResourceAssembler assembler) {

		List<Categoria> categorias = categoriaDAO.getSubcategoriasAnidadas(id);

		return assembler.toCollectionModel(categorias);
	}
	
	/**
	 * Metodo que agrupa los recursos de las subcategorias de una categoria
	 * @param id Id de la categoria
	 * @param assembler
	 * @return Lista de los recursos de las subcategorias
	 */
	@GetMapping("/categorias/{id}/recursosDeSubcategorias")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getRecursosDeSubcategorias(@PathVariable Long id,
			PersistentEntityResourceAssembler assembler) {

		List<Recurso> recursos = categoriaDAO.getRecursosDeSubcategorias(id);

		return assembler.toCollectionModel(recursos);
	}
	
	/**
	 * Metodo que agrupa las categorias padre de la aplicacion
	 * @param assembler
	 * @return Lista de categorias padre de la aplicacion
	 */
	@GetMapping("/categorias/padre")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getCategoriasPadre(PersistentEntityResourceAssembler assembler) {

		List<Categoria> categorias = categoriaDAO.getCategoriasPadre();

		return assembler.toCollectionModel(categorias);
	}
}