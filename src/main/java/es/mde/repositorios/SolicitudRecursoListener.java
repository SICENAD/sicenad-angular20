package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.SolicitudRecurso;

@Component
public class SolicitudRecursoListener {

	private Logger log = LoggerFactory.getLogger(SolicitudRecursoListener.class);
	
	@PostPersist
	public void postGuardar(SolicitudRecurso solicitudRecurso) {
		solicitudRecurso.setIdString(solicitudRecurso.getId().toString());
		System.err.println("Se ha guardado la solicitudRecurso con Id " + solicitudRecurso.getIdString());
	}
	
}