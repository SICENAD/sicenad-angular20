package es.mde.security.usuarios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Representa la interfaz que expone para la API los superadministradores 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="usuarios_superadministrador", collectionResourceRel="usuarios_superadministrador", itemResourceRel="usuario_superadministrador") 
public interface UsuarioSuperadministradorDAO extends JpaRepository<UsuarioSuperadministrador, Long> {
	
	Optional<UsuarioSuperadministrador> findByUsername(String username);
}