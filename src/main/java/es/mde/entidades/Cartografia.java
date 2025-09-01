package es.mde.entidades;

import java.util.Date;
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

import com.fasterxml.jackson.annotation.JsonFormat;

import es.mde.repositorios.CartografiaListener;

/**
 * Representa un conjunto cartografico de un CENAD/CMT
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "CARTOGRAFIAS")
@EntityListeners(CartografiaListener.class)
public class Cartografia {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	private String nombre;
	private String nombreArchivo;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CATEGORIA_FICHERO", nullable = false)
	private CategoriaFichero categoriaFichero;
	private String escala;
	private String sistemaReferencia;
	private String descripcion;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaCartografia;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CENAD", nullable = false)
	private Cenad cenad;

	/**
	 * Crea un conjunto cartografico de un CENAD/CMT
	 */
	public Cartografia() {
	}

	/**
	 * Devuelve el id de un conjunto cartografico
	 * 
	 * @return Devuelve el id de un conjunto cartografico
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el id de un conjunto cartografico
	 * 
	 * @param id Guarda el id de un conjunto cartografico
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de un conjunto cartografico
	 * @return Devuelve el id de un conjunto cartografico
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de un conjunto cartografico
	 * @param idString Guarda el id de un conjunto cartografico
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre de un conjunto cartografico
	 * 
	 * @return Devuelve el nombre de un conjunto cartografico
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre de un conjunto cartografico
	 * 
	 * @param nombre Nombre de un conjunto cartografico
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve el nombre del archivo de un conjunto cartografico
	 * 
	 * @return Devuelve el nombre del archivo de un conjunto cartografico
	 */
	public String getNombreArchivo() {
		return nombreArchivo;
	}

	/**
	 * Guarda el nombre del archivo de un conjunto cartografico
	 * 
	 * @param nombre Nombre del archivo de un conjunto cartograficoa
	 */
	public void setNombreArchivo(String nombreArchivo) {
		this.nombreArchivo = nombreArchivo;
	}

	/**
	 * Devuelve la categoria de fichero
	 * 
	 * @return Devuelve la categoria de fichero
	 */
	public CategoriaFichero getCategoriaFichero() {
		return categoriaFichero;
	}

	/**
	 * Guarda la categoria de fichero
	 * 
	 * @param categoriaFichero Categoria de fichero del conjunto cartografico
	 */
	public void setCategoriaFichero(CategoriaFichero categoriaFichero) {
		this.categoriaFichero = categoriaFichero;
	}

	/**
	 * Devuelve la escala de un mapa
	 * 
	 * @return Devuelve la escala del mapa
	 */
	public String getEscala() {
		return escala;
	}

	/**
	 * Guarda la escala de un mapa
	 * 
	 * @param escala Escala del conjunto cartografico
	 */
	public void setEscala(String escala) {
		this.escala = escala;
	}

	/**
	 * Devuelve el sistema de referencia
	 * 
	 * @return Devuelve el sistema de referencia
	 */
	public String getSistemaReferencia() {
		return sistemaReferencia;
	}

	/**
	 * Guarda el sistema de referencia
	 * 
	 * @param sistemaReferencia Sistema de referencia del sistema cartografico
	 */
	public void setSistemaReferencia(String sistemaReferencia) {
		this.sistemaReferencia = sistemaReferencia;
	}

	/**
	 * Devuelve la descripción del conjunto cartográfico
	 * 
	 * @return Devuelve la descripción del conjunto cartográfico
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripción del conjunto cartográfico
	 * 
	 * @param descripcion Descripción del conjunto cartográfico
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	/**
	 * Devuelve la fecha del conjunto cartografico
	 * 
	 * @return Devuelve la fecha del conjunto cartografico
	 */
	public Date getFechaCartografia() {
		return fechaCartografia;
	}

	/**
	 * Guarda la fecha de actualizacion del conjunto cartografico
	 * 
	 * @param fechaCartografia Fecha en la que se actualiza la cartografia
	 */
	public void setFechaCartografia(Date fechaCartografia) {
		this.fechaCartografia = fechaCartografia;
	}

	/**
	 * Devuelve el CENAD del conjunto cartografico
	 * 
	 * @return Devuelve el CENAD del conjunto cartografico
	 */
	public Cenad getCenad() {
		return cenad;
	}

	/**
	 * Guarda el CENAD del conjunto cartografico
	 * 
	 * @param cenad CENAD del conjunto cartografico
	 */
	public void setCenad(Cenad cenad) {
		this.cenad = cenad;
	}
}