package es.mde.repositorios;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import es.mde.entidades.Categoria;

/**
 * Representa la interfaz que expone para la API las categorias 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="categorias", collectionResourceRel="categorias", itemResourceRel="categoria") 
public interface CategoriaDAO extends JpaRepository<Categoria, Long>, CategoriaDAOCustom {
	
	/**
	 * Devuelve una lista de categorias que contiene ese texto en su nombre
	 * @param txt Texto que esta incluido en el nombre de las categorias buscadas
	 * @return Devuelve una lista de categorias que contiene ese texto en su nombre
	 */
	@RestResource(path="nombre")
	List<Categoria> findByNombreIgnoreCaseContaining(@Param("nombre") String txt);
}