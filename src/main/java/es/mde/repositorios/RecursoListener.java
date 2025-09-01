package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Recurso;

@Component
public class RecursoListener {

	private Logger log = LoggerFactory.getLogger(RecursoListener.class);
	
	@PostPersist
	public void postGuardar(Recurso recurso) {
		recurso.setIdString(recurso.getId().toString());
		System.err.println("Se ha guardado el recurso: " + recurso.getNombre() + " con Id " + recurso.getIdString());
	}
	
}