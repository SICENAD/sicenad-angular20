package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Fichero;

@Component
public class FicheroListener {

	private Logger log = LoggerFactory.getLogger(FicheroListener.class);
	
	@PostPersist
	public void postGuardar(Fichero fichero) {
		fichero.setIdString(fichero.getId().toString());
		System.err.println("Se ha guardado el fichero: " + fichero.getNombre() + " con Id " + fichero.getIdString());
	}
	
}