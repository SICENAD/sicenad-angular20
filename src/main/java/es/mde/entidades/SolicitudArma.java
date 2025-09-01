package es.mde.entidades;

import es.mde.repositorios.SolicitudArmaListener;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Representa un conjunto SOLICITUD-ARMA (es la tabla intermedia que se crea en la relación Many to Many entre ARMA y SOLICITUD)
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "SOLICITUDES_ARMAS")
@EntityListeners(SolicitudArmaListener.class)
public class SolicitudArma {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	private int coordXAsentamiento;
	private int coordYAsentamiento;
	private int coordXPuntoCaida;
	private int coordYPuntoCaida;
	private int alcanceMax;
	private int zonaSegAngulo;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ARMA")
	private Arma arma;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SOLICITUD")
	private SolicitudRecurso solicitud;

	/**
	 * Crea un "par" SOLICITUD-ARMA, para la relación Many to Many entre ambas
	 */
	public SolicitudArma() {
		super();
	}

	/**
	 * Devuelve el id del "par" SOLICITUD-ARMA
	 * @return Devuelve el id del "par" SOLICITUD-ARMA
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el id del "par" SOLICITUD-ARMA
	 * @param id Id del "par" SOLICITUD-ARMA
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id del "par" SOLICITUD-ARMA
	 * @return Devuelve el id del "par" SOLICITUD-ARMA
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id del "par" SOLICITUD-ARMA
	 * @param idString Guarda el id del "par" SOLICITUD-ARMA
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve las coordenadas X del asentamiento del "par" SOLICITUD-ARMA
	 * @return Devuelve las coordenadas X del asentamiento del "par" SOLICITUD-ARMA
	 */
	public int getCoordXAsentamiento() {
		return coordXAsentamiento;
	}

	/**
	 * Guarda las coordenadas X del asentamiento del "par" SOLICITUD-ARMA
	 * @param coordAsentamiento Coordenadas X del asentamiento del "par" SOLICITUD-ARMA
	 */
	public void setCoordXAsentamiento(int coordXAsentamiento) {
		this.coordXAsentamiento = coordXAsentamiento;
	}
	
	/**
	 * Devuelve las coordenadas Y del asentamiento del "par" SOLICITUD-ARMA
	 * @return Devuelve las coordenadas Y del asentamiento del "par" SOLICITUD-ARMA
	 */
	public int getCoordYAsentamiento() {
		return coordYAsentamiento;
	}

	/**
	 * Guarda las coordenadas Y del asentamiento del "par" SOLICITUD-ARMA
	 * @param coordAsentamiento Coordenadas Y del asentamiento del "par" SOLICITUD-ARMA
	 */
	public void setCoordYAsentamiento(int coordYAsentamiento) {
		this.coordYAsentamiento = coordYAsentamiento;
	}

	/**
	 * Devuelve las coordenadas X del punto de caída del "par" SOLICITUD-ARMA
	 * @return Devuelve las coordenadas X del punto de caída del "par" SOLICITUD-ARMA
	 */
	public int getCoordXPuntoCaida() {
		return coordXPuntoCaida;
	}

	/**
	 * Guarda las coordenadas X del punto de caída del "par" SOLICITUD-ARMA
	 * @param coordPuntoCaida Coordenadas X del punto de caída del "par" SOLICITUD-ARMA
	 */
	public void setCoordXPuntoCaida(int coordXPuntoCaida) {
		this.coordXPuntoCaida = coordXPuntoCaida;
	}
	
	/**
	 * Devuelve las coordenadas Y del punto de caída del "par" SOLICITUD-ARMA
	 * @return Devuelve las coordenadas Y del punto de caída del "par" SOLICITUD-ARMA
	 */
	public int getCoordYPuntoCaida() {
		return coordYPuntoCaida;
	}

	/**
	 * Guarda las coordenadas Y del punto de caída del "par" SOLICITUD-ARMA
	 * @param coordPuntoCaida Coordenadas Y del punto de caída del "par" SOLICITUD-ARMA
	 */
	public void setCoordYPuntoCaida(int coordYPuntoCaida) {
		this.coordYPuntoCaida = coordYPuntoCaida;
	}

	/**
	 * Devuelve el alcance máximo del "par" SOLICITUD-ARMA
	 * @return Devuelve el alcance máximo del "par" SOLICITUD-ARMA
	 */
	public int getAlcanceMax() {
		return alcanceMax;
	}

	/**
	 * Guarda el alcance máximo del "par" SOLICITUD-ARMA
	 * @param alcanceMax Alcance máximo del "par" SOLICITUD-ARMA
	 */
	public void setAlcanceMax(int alcanceMax) {
		this.alcanceMax = alcanceMax;
	}

	/**
	 * Devuelve el ángulo de la zona de seguridad del "par" SOLICITUD-ARMA
	 * @return Devuelve el ángulo de la zona de seguridad del "par" SOLICITUD-ARMA
	 */
	public int getZonaSegAngulo() {
		return zonaSegAngulo;
	}

	/**
	 * Guarda el ángulo de la zona de seguridad del "par" SOLICITUD-ARMA
	 * @param zonaSegAngulo Angulo de la zona de seguridad del "par" SOLICITUD-ARMA
	 */
	public void setZonaSegAngulo(int zonaSegAngulo) {
		this.zonaSegAngulo = zonaSegAngulo;
	}

	/**
	 * Devuelve el arma del "par" SOLICITUD-ARMA
	 * @return Devuelve el arma del "par" SOLICITUD-ARMA
	 */
	public Arma getArma() {
		return arma;
	}

	/**
	 * Guarda el arma del "par" SOLICITUD-ARMA
	 * @param arma Arma del "par" SOLICITUD-ARMA
	 */
	public void setArma(Arma arma) {
		this.arma = arma;
	}

	/**
	 * Devuelve la solicitud del "par" SOLICITUD-ARMA
	 * @return Devuelve la solicitud del "par" SOLICITUD-ARMA
	 */
	public SolicitudRecurso getSolicitud() {
		return solicitud;
	}

	/**
	 * Guarda la solicitud del "par" SOLICITUD-ARMA
	 * @param solicitud Solicitud del "par" SOLICITUD-ARMA
	 */
	public void setSolicitud(SolicitudRecurso solicitud) {
		this.solicitud = solicitud;
	}
}