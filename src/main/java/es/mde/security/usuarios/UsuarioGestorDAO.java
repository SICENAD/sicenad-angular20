package es.mde.security.usuarios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Representa la interfaz que expone para la API los gestores 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="usuarios_gestor", collectionResourceRel="usuarios_gestor", itemResourceRel="usuario_gestor") 
public interface UsuarioGestorDAO extends JpaRepository<UsuarioGestor, Long> {
	
	Optional<UsuarioGestor> findByUsername(String username);
}