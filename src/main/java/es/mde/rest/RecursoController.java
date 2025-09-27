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
import es.mde.entidades.CategoriaFichero;
import es.mde.entidades.SolicitudRecurso;
import es.mde.repositorios.RecursoDAO;

/**
 * Controlador que maneja los metodos personalizados de los recursos
 */
@RepositoryRestController
// @RequestMapping(path = "/recursos/{id}")
@Configuration
public class RecursoController {
	private RecursoDAO recursoDAO;

	/**
	 * Controlador para ejecutar los metodos personalizados
	 * 
	 * @param recursoDAO DAO de recurso
	 */
	public RecursoController(RecursoDAO recursoDAO) {
		this.recursoDAO = recursoDAO;
	}

	/**
	 * Metodo que agrupa las categorias de fichero de los ficheros de un recurso
	 * 
	 * @param id        Id del recurso
	 * @param assembler
	 * @return Lista de categorias de fichero de ese recurso
	 */
	@GetMapping("/recursos/{id}/categoriasFichero")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getCategoriasFicheroDeRecurso(@PathVariable Long id,
			PersistentEntityResourceAssembler assembler) {

		List<CategoriaFichero> categoriasFichero = recursoDAO.getCategoriasFicheroDeRecurso(id);

		return assembler.toCollectionModel(categoriasFichero);
	}

	/**
	 * Metodo que agrupa las solicitudes de un recurso por estado
	 * 
	 * @param id Id del recurso
	 * @param estado Estado de la solicitud
	 * @param assembler
	 * @return Lista de las solicitudes de un recurso
	 */
	@GetMapping("/recursos/{id}/solicitudesEstado/{estado}")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getSolicitudesRecursoEstado(@PathVariable Long id,
			@PathVariable String estado,
			PersistentEntityResourceAssembler assembler) {

		List<SolicitudRecurso> solicitudes = recursoDAO.getSolicitudesDeRecursoPorEstado(id, estado);

		return assembler.toCollectionModel(solicitudes);
	}
}