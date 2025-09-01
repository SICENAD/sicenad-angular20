package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Unidad;

@Component
public class UnidadListener {

	private Logger log = LoggerFactory.getLogger(UnidadListener.class);
	
	@PostPersist
	public void postGuardar(Unidad unidad) {
		unidad.setIdString(unidad.getId().toString());
		System.err.println("Se ha guardado la unidad: " + unidad.getNombre() + " con Id " + unidad.getIdString());
	}
	
}