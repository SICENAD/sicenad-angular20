package es.mde.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import es.mde.entidades.Unidad;

/**
 * Representa la interfaz que expone para la API las unidades 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="unidades", collectionResourceRel="unidades", itemResourceRel="unidad") 
public interface UnidadDAO extends JpaRepository<Unidad, Long> {}