package es.mde.security.usuarios;

import java.util.ArrayList;
import java.util.Collection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import org.springframework.stereotype.Component;

import es.mde.entidades.SolicitudRecurso;
import es.mde.entidades.Unidad;

/**
 * Representa a los usuarios de "unidades" que soliciten recursos...
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@DiscriminatorValue("UN")
@Component
@EntityListeners(UsuarioNormalListener.class)
public class UsuarioNormal extends Usuario {
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "UNIDAD")
	private Unidad unidad;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = SolicitudRecurso.class, mappedBy = "usuarioNormal")
	private Collection<SolicitudRecurso> solicitudes = new ArrayList<>();
	
	/**
	 * Crea un usuario normal
	 */
	public UsuarioNormal() {}

	/**
	 * Devuelve la unidad a la que pertenece el usuario
	 * @return Devuelve la unidad a la que pertenece el usuario
	 */
	public Unidad getUnidad() {
		return unidad;
	}

	/**
	 * Guarda la unidad del usuario
	 * @param unidad Unidad a la que pertenece el usuario
	 */
	public void setUnidad(Unidad unidad) {
		this.unidad = unidad;
	}
	
	/**
	 * Devuelve las solicitudes que ha generado ese usuario
	 * @return Devuelve las solicitudes que ha generado ese usuario
	 */
	public Collection<SolicitudRecurso> getSolicitudes() {
		return solicitudes;
	}

	/**
	 * Guarda las solicitudes generadas por un usuario
	 * @param solicitudes Solicitudes generadas por el usuario
	 */
	public void setSolicitudes(Collection<SolicitudRecurso> solicitudes) {
		this.solicitudes = solicitudes;
	}

	// Establece la relacion en los dos sentidos
	/**
	 * Agrega una solicitud al usuario
	 * @param solicitud Solicitud agregada
	 */
	public void addSolicitudes(SolicitudRecurso solicitud) {
		getSolicitudes().add(solicitud);
		solicitud.setUsuarioNormal(this);
	}
}