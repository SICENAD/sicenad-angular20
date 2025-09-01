package es.mde.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import es.mde.entidades.Cartografia;

/**
 * Representa la interfaz que expone para la API los conjuntos cartograficos 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="cartografias", collectionResourceRel="cartografias", itemResourceRel="cartografia") 
public interface CartografiaDAO extends JpaRepository<Cartografia, Long> {
}