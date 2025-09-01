package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;

import es.mde.repositorios.CategoriaFicheroListener;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * CategoríaFichero va a representar los diferentes tipos de fichero que considera la aplicación.
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "CATEGORIAS_FICHERO")
@EntityListeners(CategoriaFicheroListener.class)
public class CategoriaFichero {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	private String nombre; //Imagen, normativa, instrucciones, se definiran muchas en el front.
	private String descripcion;
	private int tipo; //0 para imagenes y 1 para otros archivos
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Fichero.class, mappedBy = "categoriaFichero")
	private Collection<Fichero> ficheros = new ArrayList<>();
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Cartografia.class, mappedBy = "categoriaFichero")
	private Collection<Cartografia> cartografias = new ArrayList<>();
	
	/**
	 * Crea una categoría de fichero
	 */
	public CategoriaFichero() {}

	/**
	 * Devuelve el Id de una categoría de fichero
	 * @return Devuelve el Id de la categoría de fichero
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el Id de una categoría de fichero
	 * @param id Id de la categoría de fichero
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de una categoría de fichero
	 * @return Devuelve el id una categoría de fichero
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id una categoría de fichero
	 * @param idString Guarda el id una categoría de fichero
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre de una categoría de fichero
	 * @return Devuelve el nombre de la categoría de fichero
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre de una categoría de fichero
	 * @param nombre Nombre de la categoría de fichero
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve la descripción de una categoría de fichero
	 * @return Devuelve la descripción de la categoría de fichero
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripción de una categoría de fichero
	 * @param descripcion Descripción de la categoría de fichero
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	/**
	 * Devuelve el tipo de una categoría de fichero
	 * @return Devuelve el tipo de la categoría de fichero
	 */
	public int getTipo() {
		return tipo;
	}

	/**
	 * Guarda el tipo de una categoría de fichero
	 * @param tipo Tipo de la categoría de fichero
	 */
	public void setTipo(int tipo) {
		this.tipo = tipo;
	}
	
	/**
	 * Devuelve los ficheros que pertenecen a una categoría de fichero
	 * @return Devuelve los ficheros que pertenecen a la categoría de fichero
	 */
	public Collection<Fichero> getFicheros() {
		return ficheros;
	}
	
	/**
	 * Guarda los ficheros que pertenecen a una categoría de fichero
	 * @param ficheros Ficheros que pertenecen a la categoría de fichero
	 */
	public void setFicheros(Collection<Fichero> ficheros) {
		this.ficheros = ficheros;
	}
	
	/**
	 * Devuelve las cartografías que pertenecen a una categoría de fichero
	 * @return Devuelve las cartografías que pertenecen a la categoría de fichero
	 */
	public Collection<Cartografia> getCartografias() {
		return cartografias;
	}
	
	/**
	 * Guarda las cartografías que pertenecen a una categoría de fichero
	 * @param ficheros Cartografías que pertenecen a la categoría de fichero
	 */
	public void setCartografias(Collection<Cartografia> cartografias) {
		this.cartografias = cartografias;
	}
	
	/**
	 * Añade el fichero a la categoría de fichero. Establece la relacion en los dos sentidos
	 * @param fichero Fichero añadido a la categoría de fichero
	 */ 
	public void addFichero(Fichero fichero) {
		getFicheros().add(fichero);
		fichero.setCategoriaFichero(this);
	}
	
	/**
	 * Añade la cartografía a la categoría de fichero. Establece la relacion en los dos sentidos
	 * @param cartografía Cartografía añadida a la categoría de fichero
	 */ 
	public void addCartografia(Cartografia cartografia) {
		getCartografias().add(cartografia);
		cartografia.setCategoriaFichero(this);
	}
}