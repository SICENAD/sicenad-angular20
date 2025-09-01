package es.mde.repositorios;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import es.mde.entidades.Categoria;
import es.mde.entidades.Cenad;
import es.mde.entidades.Recurso;
import es.mde.entidades.SolicitudRecurso;

/**
 * Representa la clase implementada con los metodos personalizados de los CENAD,s 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Transactional(readOnly = true)
public class CenadDAOImpl implements CenadDAOCustom {
	@Autowired
	CenadDAO cenadDAO;

	@PersistenceContext
	EntityManager entityManager;
	
	/**
	 * Devuelve una lista de las categorias padre de un CENAD
	 * @param id Id del CENAD
	 * @return Devuelve una lista de las categorias padre de un CENAD
	 */
	@Override 
	public List<Categoria> getCategoriasPadreCenad(Long id) {
		List<Categoria> categorias = cenadDAO.findById(id).get().getCategorias().stream().filter(c -> c.getCategoriaPadre() == null).collect(Collectors.toList());
		return categorias;
	}

	/**
	 * Devuelve una lista de los recursos de un CENAD
	 * @param id Id del CENAD
	 * @return Devuelve una lista de los recursos de un CENAD
	 */
	@Override 
	public List<Recurso> getRecursosCenad(Long id) {
		List<Recurso> recursos = new ArrayList<Recurso>();
		List<Categoria> categorias = cenadDAO.findById(id).get().getCategorias().stream().collect(Collectors.toList());
		categorias.forEach(c -> recursos.addAll(c.getRecursos()));
		return recursos;
	}

	/**
	 * Devuelve una lista de las solicitudes de un CENAD
	 * @param id Id del CENAD
	 * @return Devuelve una lista de las solicitudes de un CENAD
	 */
	@Override 
	public List<SolicitudRecurso> getSolicitudesCenad(Long id) {
		List<SolicitudRecurso> solicitudes = new ArrayList<SolicitudRecurso>();
		List<Recurso> recursos = this.getRecursosCenad(id);
		recursos.forEach(r -> solicitudes.addAll(r.getSolicitudes()));
		return solicitudes;
	}	
	
	/**
	 * Devuelve una lista de los CENAD sin administrador
	 * @return Devuelve una lista de los CENAD sin administrador
	 */
	@Override 
	public List<Cenad> getCenadsSinAdmin() {
		List<Cenad> cenads = cenadDAO.findAll().stream()
				.filter(j -> j.getUsuarioAdministrador() == null).collect(Collectors.toList());
		return cenads;
	}
	
	/**
	 * Devuelve una lista de las solicitudes de un Cenad que tienen ese estado
	 * @return lista de solicitudes
	 * 
	 */
	@Override
	public List<SolicitudRecurso> getSolicitudesCenadEstado(Long id, String estado) {
		List<SolicitudRecurso> solicitudes = new ArrayList<SolicitudRecurso>();
		solicitudes = this.getSolicitudesCenad(id).stream().filter(s -> s.getEstado().equalsIgnoreCase(estado)).collect(Collectors.toList());		
		return solicitudes;
	}	
}