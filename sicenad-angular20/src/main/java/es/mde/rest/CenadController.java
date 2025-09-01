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
import es.mde.entidades.Cenad;
import es.mde.entidades.Recurso;
import es.mde.entidades.SolicitudRecurso;
import es.mde.repositorios.CenadDAO;

/**
 * Controlador que maneja los metodos personalizados de los CENADS
 */
@RepositoryRestController
//@RequestMapping(path = "/cenads")
@Configuration
public class CenadController {
	private CenadDAO cenadDAO;

	/**
	 * Controlador para ejecutar los metodos personalizados
	 * @param cenadDAO DAO de CENAD
	 */
	public CenadController(CenadDAO cenadDAO) {
		this.cenadDAO = cenadDAO;
	}
	
	/**
	 * Metodo para recuperar los CENAD,s sin administrador
	 * @param assembler
	 * @return Lista de CENAD,s sin administrador
	 */
	@GetMapping("/cenads/sinAdmin")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getCenadsSinAdmin(PersistentEntityResourceAssembler assembler) {
		List<Cenad> cenads = cenadDAO.getCenadsSinAdmin();

		return assembler.toCollectionModel(cenads);
	}
	
	/**
	 * Metodo que agrupa las categorias Padre de un CENAD
	 * @param id Id del CENAD
	 * @param assembler
	 * @return Lista de las categorias Padre de un CENAD
	 */
	@GetMapping("/cenads/{id}/categoriasPadre")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getCategoriasPadreCenad(@PathVariable Long id,
			PersistentEntityResourceAssembler assembler) {

		List<Categoria> categorias = cenadDAO.getCategoriasPadreCenad(id);

		return assembler.toCollectionModel(categorias);
	}
	
	/**
	 * Metodo que agrupa los recursos de un CENAD
	 * @param id Id del CENAD
	 * @param assembler
	 * @return Lista de los recursos de un CENAD
	 */
	@GetMapping("/cenads/{id}/recursos")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getRecursosCenad(@PathVariable Long id,
			PersistentEntityResourceAssembler assembler) {

		List<Recurso> recursos = cenadDAO.getRecursosCenad(id);

		return assembler.toCollectionModel(recursos);
	}
	
	/**
	 * Metodo que agrupa las solicitudes de un CENAD
	 * @param id Id del CENAD
	 * @param assembler
	 * @return Lista de las solicitudes de un CENAD
	 */
	@GetMapping("/cenads/{id}/solicitudes")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getSolicitudesCenad(@PathVariable Long id,
			PersistentEntityResourceAssembler assembler) {

		List<SolicitudRecurso> solicitudes = cenadDAO.getSolicitudesCenad(id);

		return assembler.toCollectionModel(solicitudes);
	}
	
	/**
	 * Metodo que agrupa las solicitudes de un CENAD
	 * @param id del Cenad y estado de la solicitud
	 * @param assembler
	 * @return Lista de las solicitudes de un CENAD
	 */
	@GetMapping("/cenads/{id}/solicitudesEstado/{estado}")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getSolicitudesCenadEstado(@PathVariable Long id, @PathVariable String estado,
			PersistentEntityResourceAssembler assembler) {

		List<SolicitudRecurso> solicitudes = cenadDAO.getSolicitudesCenadEstado(id, estado);

		return assembler.toCollectionModel(solicitudes);
	}
}