package es.mde.repositorios;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import es.mde.entidades.Cenad;

/**
 * Representa la interfaz que expone para la API los CENADS 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="cenads", collectionResourceRel="cenads", itemResourceRel="cenad") 
public interface CenadDAO extends JpaRepository<Cenad, Long>, CenadDAOCustom {
	
	/**
	 * Devuelve una lista de CENADS que contiene ese texto en su nombre
	 * @param txt Texto que esta incluido en el nombre de los CENADS buscados
	 * @return Devuelve una lista de CENADS que contiene ese texto en su nombre
	 */
	@RestResource(path="nombre")
	List<Cenad> findByNombreIgnoreCaseContaining(@Param("nombre") String txt);
}