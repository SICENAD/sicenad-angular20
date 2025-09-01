package es.mde.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import es.mde.entidades.TipoFormulario;

/**
 * Representa la interfaz que expone para la API los tipos de formulario 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RepositoryRestResource(path="tipos_formulario", collectionResourceRel="tipos_formulario", itemResourceRel="tipo_formulario") 
public interface TipoFormularioDAO extends JpaRepository<TipoFormulario, Long> {}