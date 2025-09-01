package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;

import es.mde.repositorios.TipoFormularioListener;
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
 * Representa los distintos tipos de formularios, que generaran distintos campos en las solicitudes
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name="TIPOS_FORMULARIO")
@EntityListeners(TipoFormularioListener.class)
public class TipoFormulario {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(unique=true)
	private Long id;
	private String idString;
	private String nombre;
	private String descripcion;
	private int codTipo;//no se usa
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Recurso.class, mappedBy = "tipoFormulario")
	private Collection<Recurso> recursos = new ArrayList<>();
	
	/**
	 * Crea un tipo de formulario
	 */
	public TipoFormulario() {}

	/**
	 * Devuelve el Id de un tipo de formulario
	 * @return Devuelve el Id de un tipo de formulario
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el Id de un tipo de formulario
	 * @param id Id del tipo de formulario
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de un tipo de formulario
	 * @return Devuelve el id de un tipo de formulario
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de un tipo de formulario
	 * @param idString Guarda el id de un tipo de formulario
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre del tipo de formulario
	 * @return Devuelve el nombre del tipo de formulario
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre del tipo de formulario
	 * @param nombre Nombre del tipo de formulario
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve la descripcion del tipo de formulario
	 * @return Devuelve la descripcion del tipo de formulario
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripcion del tipo de formulario
	 * @param descripcion Descripcion del tipo de formulario
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	//no se usa
	public int getCodTipo() {
		return codTipo;
	}

	//no se usa
	public void setCodTipo(int codTipo) {
		this.codTipo = codTipo;
	}

	/**
	 * Devuelve los recursos que tienen ese tipo de formulario
	 *  Devuelve los recursos que tienen ese tipo de formulario@return
	 */
	public Collection<Recurso> getRecursos() {
		return recursos;
	}

	/**
	 * Guarda los recursos que tienen ese tipo de formulario
	 * @param recursos Recursos de ese tipo de fomrulario
	 */
	public void setRecursos(Collection<Recurso> recursos) {
		this.recursos = recursos;
	};
	
	// Establece la relacion en los dos sentidos
	/**
	 * Agrega el recurso al tipo de formulario
	 * @param recurso Recurso agregado
	 */
	public void addRecurso(Recurso recurso) {
		getRecursos().add(recurso);
		recurso.setTipoFormulario(this);
	}
}