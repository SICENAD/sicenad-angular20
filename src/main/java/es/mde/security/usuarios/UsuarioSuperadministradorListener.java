package es.mde.security.usuarios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class UsuarioSuperadministradorListener {

	private Logger log = LoggerFactory.getLogger(UsuarioSuperadministradorListener.class);
	
	@PostPersist
	public void postGuardar(UsuarioSuperadministrador usuario) {
		usuario.setIdString(usuario.getId().toString());
		System.err.println("Se ha guardado al usuario superadministrador: " + usuario.getUsername() + " con Id " + usuario.getIdString());
	}
	
}