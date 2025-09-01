package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;

import es.mde.repositorios.ArmaListener;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Representa un Arma (se tiene en cuenta en las Zonas de Caída)
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "ARMAS")
@EntityListeners(ArmaListener.class)
public class Arma {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	private String nombre;
	private String tipoTiro;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = SolicitudArma.class, mappedBy = "arma")
	private Collection<SolicitudArma> armasSolicitudes = new ArrayList<>();

	/**
	 * Crea un arma (se tiene en cuenta en las zonas de caída)
	 */
	public Arma() {
		super();
	}

	/**
	 * Devuelve el id de un arma
	 * @return Devuelve el id de un arma
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el id de un arma
	 * @param id Guarda el id de un arma
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de un arma
	 * @return Devuelve el id de un arma
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de un arma
	 * @param idString Guarda el id de un arma
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre de un arma
	 * @return Devuelve el nombre de un arma
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre de un arma
	 * @param nombre Nombre de un arma
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve el Tipo de tiro de un arma
	 * @return Devuelve el Tipo de tiro de un arma
	 */
	public String getTipoTiro() {
		return tipoTiro;
	}

	/**
	 * Guarda el Tipo de tiro de un arma
	 * @param tipoTiro Tipo de tiro de un arma
	 */
	public void setTipoTiro(String tipoTiro) {
		this.tipoTiro = tipoTiro;
	}

	/**
	 * Devuelve la colección de ARMAS-SOLICITUDES (tabla intermedia) de un arma
	 * @return Devuelve la colección de ARMAS-SOLICITUDES (tabla intermedia) de un arma
	 */
	public Collection<SolicitudArma> getArmasSolicitudes() {
		return armasSolicitudes;
	}

	/**
	 * Guarda la colección de ARMAS-SOLICITUDES (tabla intermedia) de un arma
	 * @param armasSolicitudes Colección de ARMAS-SOLICITUDES (tabla intermedia) de un arma
	 */
	public void setArmasSolicitudes(Collection<SolicitudArma> armasSolicitudes) {
		this.armasSolicitudes = armasSolicitudes;
	}

	// Establece la relacion en los dos sentidos
	/**
	 * Agrega la SOLICITUD-ARMA (tabla intermedia) al arma
	 * @param SOLICITUD-ARMA (tabla intermedia) agregada al arma
	 */
	public void addArmaSolicitud(SolicitudArma solicitudArma) {
		getArmasSolicitudes().add(solicitudArma);
		solicitudArma.setArma(this);
	}
}