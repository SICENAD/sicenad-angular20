package es.mde.security.usuarios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class UsuarioGestorListener {

	private Logger log = LoggerFactory.getLogger(UsuarioGestorListener.class);
	
	@PostPersist
	public void postGuardar(UsuarioGestor usuario) {
		usuario.setIdString(usuario.getId().toString());
		System.err.println("Se ha guardado al usuario gestor: " + usuario.getUsername() + " con Id " + usuario.getIdString());
	}
	
}