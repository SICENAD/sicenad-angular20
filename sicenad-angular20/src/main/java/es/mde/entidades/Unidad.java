package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;

import es.mde.repositorios.UnidadListener;
import es.mde.security.usuarios.UsuarioNormal;
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
 * Representa las unidades que utilizarán los recursos de los CENADS
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name="UNIDADES")
@EntityListeners(UnidadListener.class)
public class Unidad {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(unique=true)
	private Long id;
	private String idString;
	private String nombre;
	private String descripcion;
	private String email;
	private String tfno;
	private String direccion;
	private String poc;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = UsuarioNormal.class, mappedBy = "unidad")
	private Collection<UsuarioNormal> usuariosNormal = new ArrayList<>();
	
	/**
	 * Crea una unidad
	 */
	public Unidad() {
		super();
	}
	
	/**
	 * Devuelve el Id de una unidad
	 * @return Devuelve el Id de la unidad
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el Id de la unidad
	 * @param id Id de la unidad
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de la unidad
	 * @return Devuelve el id de la unidad
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de la unidad
	 * @param idString Guarda el id de la unidad
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre de la unidad
	 * @return Devuelve el nombre de la unidad
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre de la unidad
	 * @param nombre Nombre de la unidad
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve la descripcion de la unidad
	 * @return Devuelve la descripcion de la unidad
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripcion de la unidad
	 * @param descripcion Descripcion de la unidad
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	/**
	 * Devuelve el email de la unidad
	 * @return Devuelve el email de la unidad
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * Guarda el email de la unidad
	 * @param email Email de la unidad
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * Devuelve el telefono de la unidad
	 * @return Devuelve el telefono de la unidad
	 */
	public String getTfno() {
		return tfno;
	}

	/**
	 * Guarda el telefono de la unidad
	 * @param tfno Telefono de la unidad
	 */
	public void setTfno(String tfno) {
		this.tfno = tfno;
	}

	/**
	 * Devuelve la direccion de la unidad
	 * @return Devuelve la direccion de la unidad
	 */
	public String getDireccion() {
		return direccion;
	}

	/**
	 * Guarda la direccion de la unidad
	 * @param direccion Direccion de la unidad
	 */
	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	/**
	 * Devuelve el POC de la unidad
	 * @return Devuelve el POC de la unidad
	 */
	public String getPoc() {
		return poc;
	}

	/**
	 * Guarda el POC de la unidad
	 * @param poc POC de la unidad
	 */
	public void setPoc(String poc) {
		this.poc = poc;
	}

	/**
	 * Devuelve los usuarios normales que pertenecen a la unidad
	 * @return Devuelve los usuarios normales que pertenecen a la unidad
	 */
	public Collection<UsuarioNormal> getUsuariosNormal() {
		return usuariosNormal;
	}

	/**
	 * Guarda los usuarios normales que pertenecen a la unidad
	 * @param usuariosNormal Usuarios que pertenecen a la unidad
	 */
	public void setUsuariosNormal(Collection<UsuarioNormal> usuariosNormal) {
		this.usuariosNormal = usuariosNormal;
	}

	// Establece la relacion en los dos sentidos
	/**
	 * Agrega el usuario normal a la unidad
	 * @param usuarioNormal Usuario agregado
	 */
	public void addUsuarioNormal(UsuarioNormal usuarioNormal) {
		getUsuariosNormal().add(usuarioNormal);
		usuarioNormal.setUnidad(this);
	}
}