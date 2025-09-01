package es.mde.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import es.mde.entidades.Fichero;

/**
 * Representa la interfaz que expone para la API los ficheros 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="ficheros", collectionResourceRel="ficheros", itemResourceRel="fichero") 
public interface FicheroDAO extends JpaRepository<Fichero, Long> {}