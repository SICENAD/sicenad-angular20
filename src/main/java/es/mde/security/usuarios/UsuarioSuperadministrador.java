package es.mde.security.usuarios;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;

import org.springframework.stereotype.Component;

/**
 * Representa a los usuarios superadministradores de la aplicacion
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@DiscriminatorValue("US")
@Component
@EntityListeners(UsuarioSuperadministradorListener.class)
public class UsuarioSuperadministrador extends Usuario {
	/**
	 * Crea un usuario superadministrador
	 */
	public UsuarioSuperadministrador() {}
}