package es.mde.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import es.mde.entidades.SolicitudArma;

/**
 * Representa la interfaz que expone para la API las SOLICITUDES-ARMAS 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="solicitudesArmas", collectionResourceRel="solicitudesArmas", itemResourceRel="solicitudArma") 
public interface SolicitudArmaDAO extends JpaRepository<SolicitudArma, Long> {

}
