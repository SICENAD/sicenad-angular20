package es.mde.repositorios;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import es.mde.entidades.Recurso;

/**
 * Representa la interfaz que expone para la API los recursos 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="recursos", collectionResourceRel="recursos", itemResourceRel="recurso")
public interface RecursoDAO extends JpaRepository<Recurso, Long>, RecursoDAOCustom {
	
	/**
	 * Devuelve una lista de recursos que contiene ese texto en su nombre
	 * @param txt Texto que esta incluido en el nombre de los recursos buscados
	 * @return Devuelve una lista de recursos que contiene ese texto en su nombre
	 */
	@RestResource(path="nombre")
	List<Recurso> findByNombreIgnoreCaseContaining(@Param("nombre") String txt);
}