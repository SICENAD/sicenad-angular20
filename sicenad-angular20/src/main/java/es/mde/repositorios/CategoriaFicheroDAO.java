package es.mde.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import es.mde.entidades.CategoriaFichero;

/**
 * Representa la interfaz que expone para la API las categorias de fichero 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="categorias_fichero", collectionResourceRel="categorias_fichero", itemResourceRel="categoria_fichero") 
public interface CategoriaFicheroDAO extends JpaRepository<CategoriaFichero, Long> {}