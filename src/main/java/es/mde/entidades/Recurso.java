package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;

import es.mde.repositorios.RecursoListener;
import es.mde.security.usuarios.UsuarioGestor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Representa los recursos que ofrece cada CENAD/CMT
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "RECURSOS")
@EntityListeners(RecursoListener.class)
public class Recurso {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	private String nombre;
	@Lob
	@Column(columnDefinition = "TEXT")
	private String descripcion;
	@Lob
	@Column(columnDefinition = "TEXT")
	private String otros;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Fichero.class, mappedBy = "recurso")
	private Collection<Fichero> ficheros = new ArrayList<>();
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "USUARIO_GESTOR")
	private UsuarioGestor usuarioGestor;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CATEGORIA", nullable = false)
	private Categoria categoria;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TIPO_FORMULARIO", nullable = false)
	private TipoFormulario tipoFormulario;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = SolicitudRecurso.class, mappedBy = "recurso")
	private Collection<SolicitudRecurso> solicitudes = new ArrayList<>();
	private boolean conDatosEspecificosSolicitud;
//	@Lob	
	private String datosEspecificosSolicitud = "Ejemplo: \nHorario: 08:00h a 21:00h \nMedios CIS: medios propios de la UCO  \nSIMACET: se solicita el nodo del CENAD "
			+ "\nPOC CIS: CAP. XXX \nObservaciones Particulares:";

	/**
	 * Crea un recurso
	 */
	public Recurso() {
	}

	/**
	 * Devuelve el Id de un recurso
	 * @return Devuelve el Id de un recurso
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el Id de un recurso
	 * @param id Id del recurso
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de un recurso
	 * @return Devuelve el id de un recurso
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de un recurso
	 * @param idString Guarda el id de un recurso
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre del recurso
	 * @return Devuelve el nombre del recurso
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre del recurso
	 * @param nombre Nombre del recurso
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve la descripcion del recurso
	 * @return Devuelve la descripcion del recurso
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripcion del recurso
	 * @param descripcion Descripcion del recurso
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	/**
	 * Devuelve otra informacion de interes del recurso
	 * @return Devuelve otra informacion de interes del recurso
	 */
	public String getOtros() {
		return otros;
	}

	/**
	 * Guarda otra informacion de interes del recurso
	 * @param otros Otra informacion de interes del recurso
	 */
	public void setOtros(String otros) {
		this.otros = otros;
	}

	/**
	 * Devuelve los ficheros del recurso
	 * @return Devuelve los ficheros del recurso
	 */
	public Collection<Fichero> getFicheros() {
		return ficheros;
	}

	/**
	 * Guarda los ficheros del recurso
	 * @param ficheros Ficheros asociados a ese recurso
	 */
	public void setFicheros(Collection<Fichero> ficheros) {
		this.ficheros = ficheros;
	}

	/**
	 * Devuelve el gestor de ese recurso
	 * @return Devuelve el gestor del recurso
	 */
	public UsuarioGestor getUsuarioGestor() {
		return usuarioGestor;
	}

	/**
	 * Guarda el gestor del recurso
	 * @param usuario Gestor del recurso
	 */
	public void setUsuarioGestor(UsuarioGestor usuario) {
		this.usuarioGestor = usuario;
	}

	/**
	 * Devuelve la categoria del recurso
	 * @return Devuelve la categoria del recurso
	 */
	public Categoria getCategoria() {
		return categoria;
	}

	/**
	 * Guarda la categoria del recurso
	 * @param categoria Categoria del recurso
	 */
	public void setCategoria(Categoria categoria) {
		this.categoria = categoria;
	}

	/**
	 * Devuelve el tipo de formulario al que pertenece el recurso
	 * @return Devuelve el tipo de formulario al que pertenece el recurso
	 */
	public TipoFormulario getTipoFormulario() {
		return tipoFormulario;
	}

	/**
	 * Guarda el tipo de formulario del recurso
	 * @param tipoFormulario Tipo de formulario del recurso
	 */
	public void setTipoFormulario(TipoFormulario tipoFormulario) {
		this.tipoFormulario = tipoFormulario;
	}

	/**
	 * Devuelve las solicitudes del recurso
	 * @return Devuelve las solicitudes del recurso
	 */
	public Collection<SolicitudRecurso> getSolicitudes() {
		return solicitudes;
	}

	/**
	 * Guarda las solicitudes del recurso
	 * @param solicitudes Solicitudes del recurso
	 */
	public void setSolicitudes(Collection<SolicitudRecurso> solicitudes) {
		this.solicitudes = solicitudes;
	}

	/**
	 * Devuelve un boolean que define si la solicitud tendra datos especificos
	 * @return Devuelve un boolean que define si la solicitud tendra datos especificos
	 */
	public boolean isConDatosEspecificosSolicitud() {
		return conDatosEspecificosSolicitud;
	}

	/**
	 * Guarda el boolean que define si la solicitud tendra datos especificos
	 * @param conDatosEspecificosSolicitud Verdadero/Falso 
	 */
	public void setConDatosEspecificosSolicitud(boolean conDatosEspecificosSolicitud) {
		this.conDatosEspecificosSolicitud = conDatosEspecificosSolicitud;
	}

	/**
	 * Devuelve los datos especificos de la solicitud
	 * @return Devuelve los datos especificos de la solicitud
	 */
	public String getDatosEspecificosSolicitud() {
		return datosEspecificosSolicitud;
	}

	/**
	 * Guarda los datos especificos de la solicitud
	 * @param datosEspecificosSolicitud Datos especificos necesarios para la solicitud
	 */
	public void setDatosEspecificosSolicitud(String datosEspecificosSolicitud) {
		this.datosEspecificosSolicitud = datosEspecificosSolicitud;
	}

	// Establece la relacion en los dos sentidos
	/**
	 * Agrega el fichero al recurso
	 * @param fichero Fichero agregado
	 */
	public void addFichero(Fichero fichero) {
		getFicheros().add(fichero);
		fichero.setRecurso(this);
	}

	/**
	 * Agrega la solicitud al recurso
	 * @param solicitud Solicitud agregada
	 */
	public void addSolicitudRecurso(SolicitudRecurso solicitud) {
		getSolicitudes().add(solicitud);
		solicitud.setRecurso(this);
	}
}