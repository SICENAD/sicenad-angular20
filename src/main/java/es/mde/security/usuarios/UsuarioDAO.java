package es.mde.security.usuarios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path="usuarios", collectionResourceRel="usuarios", itemResourceRel="usuario") 
public interface UsuarioDAO extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByUsername(String username);
	Usuario findByIdString(String idString);
}
