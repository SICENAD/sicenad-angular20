package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.SolicitudArma;

@Component
public class SolicitudArmaListener {

	private Logger log = LoggerFactory.getLogger(SolicitudArmaListener.class);
	
	@PostPersist
	public void postGuardar(SolicitudArma solicitudArma) {
		solicitudArma.setIdString(solicitudArma.getId().toString());
		System.err.println("Se ha guardado la solicitudArma con Id " + solicitudArma.getIdString());
	}
	
}