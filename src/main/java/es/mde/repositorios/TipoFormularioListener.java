package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.TipoFormulario;

@Component
public class TipoFormularioListener {

	private Logger log = LoggerFactory.getLogger(TipoFormularioListener.class);
	
	@PostPersist
	public void postGuardar(TipoFormulario tipoFormulario) {
		tipoFormulario.setIdString(tipoFormulario.getId().toString());
		System.err.println("Se ha guardado el tipoFormulario: " + tipoFormulario.getNombre() + " con Id " + tipoFormulario.getIdString());
	}
	
}