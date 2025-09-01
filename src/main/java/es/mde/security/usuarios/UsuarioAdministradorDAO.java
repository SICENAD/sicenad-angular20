package es.mde.security.usuarios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Representa la interfaz que expone para la API los administradores 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="usuarios_administrador", collectionResourceRel="usuarios_administrador", itemResourceRel="usuarioAdministrador") 
public interface UsuarioAdministradorDAO extends JpaRepository<UsuarioAdministrador, Long> {
	
	Optional<UsuarioAdministrador> findByUsername(String username);
}