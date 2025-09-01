package es.mde.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import es.mde.entidades.Arma;


/**
 * Representa la interfaz que expone para la API las armas 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="armas", collectionResourceRel="armas", itemResourceRel="arma") 
public interface ArmaDAO extends JpaRepository<Arma, Long> {
	
	/**
	 * Devuelve una lista de armas que contiene ese texto en su Tipo de Tiro
	 * @param txt Texto que esta incluido en el Tipo de Tiro de las armas buscadas
	 * @return Devuelve una lista de armas que contiene ese texto en su Tipo de Tiro
	 */
	@RestResource(path="tipo")
	List<Arma> findBytipoTiroIgnoreCaseContaining(@Param("tipo") String txt);

}
