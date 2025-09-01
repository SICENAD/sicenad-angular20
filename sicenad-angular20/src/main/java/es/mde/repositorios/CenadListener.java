package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Cenad;

@Component
public class CenadListener {

	private Logger log = LoggerFactory.getLogger(CenadListener.class);
	
	@PostPersist
	public void postGuardar(Cenad cenad) {
		cenad.setIdString(cenad.getId().toString());
		System.err.println("Se ha guardado el cenad: " + cenad.getNombre() + " con Id " + cenad.getIdString());
	}
	
}