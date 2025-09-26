package es.mde.entidades;

import es.mde.repositorios.FicheroListener;
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
import jakarta.persistence.Table;

/**
 * Representa la entidad que controla los archivos adjuntos
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "FICHEROS")
@EntityListeners(FicheroListener.class)
public class Fichero {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	private String nombre;
	private String nombreArchivo;
	@Lob
	@Column(columnDefinition = "TEXT")
	private String descripcion;
	private String imagen; // campo no usado
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CATEGORIA_FICHERO", nullable = false)
	private CategoriaFichero categoriaFichero;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RECURSO")
	private Recurso recurso;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SOLICITUDRECURSO_CENAD")
	private SolicitudRecurso solicitudRecursoCenad;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SOLICITUDRECURSO_UNIDAD")
	private SolicitudRecurso solicitudRecursoUnidad;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CENAD")
	private Cenad cenad;

	/**
	 * Crea un fichero
	 */
	public Fichero() {
	}

	/**
	 * Devuelve el Id de un fichero
	 * 
	 * @return Devuelve el Id de un fichero
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el id de un fichero
	 * 
	 * @param id Id del fichero
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de un fichero
	 * @return Devuelve el id de un fichero
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de un fichero
	 * @param idString Guarda el id de un fichero
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre del fichero
	 * 
	 * @return Devuelve el nombre del fichero
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre del fichero
	 * 
	 * @param nombre Nombre del fichero
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve el nombre del archivo del fichero
	 * 
	 * @return Devuelve el nombre del archivo del fichero
	 */
	public String getNombreArchivo() {
		return nombreArchivo;
	}

	/**
	 * Guarda el nombre del archivo del fichero
	 * 
	 * @param nombreArchivo Nombre del archivo del fichero
	 */
	public void setNombreArchivo(String nombreArchivo) {
		this.nombreArchivo = nombreArchivo;
	}

	/**
	 * Devuelve la descripcion del fichero
	 * 
	 * @return Devuelve la descripcion del fichero
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripcion del fichero
	 * 
	 * @param descripcion Descripcion del fichero
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	// campo no usado
	public String getImagen() {
		return imagen;
	}

	// campo no usado
	public void setImagen(String imagen) {
		this.imagen = imagen;
	}

	/**
	 * Devuelve la categoria de fichero
	 * 
	 * @return Devuelve la categoria del fichero
	 */
	public CategoriaFichero getCategoriaFichero() {
		return categoriaFichero;
	}

	/**
	 * Guarda la categoria del fichero
	 * 
	 * @param categoriaFichero Tipo de fichero
	 */
	public void setCategoriaFichero(CategoriaFichero categoriaFichero) {
		this.categoriaFichero = categoriaFichero;
	}

	/**
	 * Devuelve el recurso al que pertenece el fichero
	 * 
	 * @return Devuelve el recurso al que pertenece el fichero
	 */
	public Recurso getRecurso() {
		return recurso;
	}

	/**
	 * Guarda el recurso al que pertenece el fichero
	 * 
	 * @param recurso Recurso al que pertenece el fichero
	 */
	public void setRecurso(Recurso recurso) {
		this.recurso = recurso;
	}

	/**
	 * Devuelve la solicitudRecurso al que pertenece el fichero
	 * 
	 * @return solicitudRecurso
	 */
	public SolicitudRecurso getSolicitudRecursoCenad() {
		return solicitudRecursoCenad;
	}
	
	/**
	 * Guarda la solicitudRecurso a la que pertenece el fichero
	 * 
	 * @param solicitudRecursoCenad
	 */
	public void setSolicitudRecursoCenad(SolicitudRecurso solicitudRecursoCenad) {
		this.solicitudRecursoCenad = solicitudRecursoCenad;
	}

	
	/**
	 * Devuelve la solicitudRecurso al que pertenece el fichero
	 * 
	 * @return solicitudRecurso
	 */
	public SolicitudRecurso getSolicitudRecursoUnidad() {
		return solicitudRecursoUnidad;
	}

	/**
	 * Guarda la solicitudRecurso a la que pertenece el fichero
	 * 
	 * @param solicitudRecursoUnidad
	 */
	public void setSolicitudRecursoUnidad(SolicitudRecurso solicitudRecursoUnidad) {
		this.solicitudRecursoUnidad = solicitudRecursoUnidad;
	}

	/**
	 * Devuelve el CENAD del fichero
	 * @return Devuelve el CENAD del fichero
	 */
	public Cenad getCenad() {
		return cenad;
	}

	/**
	 * Guarda el CENAD del fichero
	 * @param cenad CENAD del fichero
	 */
	public void setCenad(Cenad cenad) {
		this.cenad = cenad;
	}	
}