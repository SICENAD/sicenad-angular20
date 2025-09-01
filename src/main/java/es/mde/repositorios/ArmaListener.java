package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Arma;

@Component
public class ArmaListener {

	private Logger log = LoggerFactory.getLogger(ArmaListener.class);
	
	@PostPersist
	public void postGuardar(Arma arma) {
		arma.setIdString(arma.getId().toString());
		System.err.println("Se ha guardado el arma: " + arma.getNombre() + " con Id " + arma.getIdString());
	}
	
}