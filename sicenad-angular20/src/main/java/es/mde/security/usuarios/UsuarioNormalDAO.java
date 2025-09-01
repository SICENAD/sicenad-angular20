package es.mde.security.usuarios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Representa la interfaz que expone para la API los usuarios normales 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="usuarios_normal", collectionResourceRel="usuarios_normal", itemResourceRel="usuario_normal") 
public interface UsuarioNormalDAO extends JpaRepository<UsuarioNormal, Long> {
	
	Optional<UsuarioNormal> findByUsername(String username);
}