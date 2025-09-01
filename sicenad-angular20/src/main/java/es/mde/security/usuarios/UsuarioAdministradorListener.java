package es.mde.security.usuarios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class UsuarioAdministradorListener {

	private Logger log = LoggerFactory.getLogger(UsuarioAdministradorListener.class);
	
	@PostPersist
	public void postGuardar(UsuarioAdministrador usuario) {
		usuario.setIdString(usuario.getId().toString());
		System.err.println("Se ha guardado al usuario administrador: " + usuario.getUsername() + " con Id " + usuario.getIdString());
	}
	
}