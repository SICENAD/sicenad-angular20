package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;

import es.mde.repositorios.CenadListener;
import es.mde.security.usuarios.UsuarioAdministrador;
import es.mde.security.usuarios.UsuarioGestor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Representa un Centro de Adiestramiento/Campo de Maniobras y Tiro
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name="CENADS")
@EntityListeners(CenadListener.class)
public class Cenad {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique=true)
	private Long id;
	private String idString;
	private String nombre;
	private int provincia;
//	@Lob	
	private String descripcion;
	private String direccion;
	private String tfno;
	private String email;
	private String escudo;
	private String infoCenad;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Categoria.class, mappedBy = "cenad")
	private Collection<Categoria> categorias = new ArrayList<>();
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Cartografia.class, mappedBy = "cenad")
	private Collection<Cartografia> cartografias = new ArrayList<>();
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Fichero.class, mappedBy = "cenad")
	private Collection<Fichero> normativas = new ArrayList<>();
	@OneToMany(cascade = CascadeType.ALL, targetEntity = UsuarioGestor.class, mappedBy = "cenad")
	private Collection<UsuarioGestor> usuariosGestores = new ArrayList<>();
	@OneToOne(cascade = CascadeType.ALL, targetEntity = UsuarioAdministrador.class, mappedBy = "cenad")
	private UsuarioAdministrador usuarioAdministrador;
	
	/**
	 * Crea un CENAD/CMT
	 */
	public Cenad() {
		super();
	}

	/**
	 * Devuelve un Id de un CENAD
	 * @return Devuelve el Id de un CENAD
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el Id de un CENAD
	 * @param id Id del CENAD
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de un CENAD
	 * @return Devuelve el id de un CENAD
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de un CENAD
	 * @param idString Guarda el id de un CENAD
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve el nombre de un CENAD
	 * @return Devuelve el nombre del CENAD
	 */
	public String getNombre() {
		return nombre;
	}

	/**
	 * Guarda el nombre de un CENAD
	 * @param nombre Nombre del CENAD
	 */
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	/**
	 * Devuelve la provincia del CENAD
	 * @return Devuelve la provincia del CENAD
	 */
	public int getProvincia() {
		return provincia;
	}

	/**
	 * Guarda la provincia de un CENAD
	 * @param provincia Provincia del CENAD
	 */
	public void setProvincia(int provincia) {
		this.provincia = provincia;
	}

	/**
	 * Devuelve la descripon del CENAD
	 * @return Devuelve la descripcion del CENAD
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripcion del CENAD
	 * @param descripcion Descripcion del CENAD
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	/**
	 * Devuelve la direccion del CENAD
	 * @return Devuelve la direccion del CENAD
	 */
	public String getDireccion() {
		return direccion;
	}

	/**
	 * Guarda la direccion del CENAD
	 * @param direccion Direccion del CENAD
	 */
	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	/**
	 * Devuelve el telefono del CENAD
	 * @return Devuelve el telefono del CENAD
	 */
	public String getTfno() {
		return tfno;
	}

	/**
	 * Guarda el telefono del CENAD
	 * @param tfno Telefono del CENAD
	 */
	public void setTfno(String tfno) {
		this.tfno = tfno;
	}

	/**
	 * Devuelve el email del CENAD
	 * @return Devuelve el email del CENAD
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * Guarda el email del CENAD
	 * @param email Email del CENAD
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * Devuelve el nombre del archivo del escudo del CENAD
	 * @return Devuelve el nombre del archivo del escudo del CENAD
	 */
	public String getEscudo() {
		return escudo;
	}

	/**
	 * Guarda el nombre del archivo del escudo del CENAD
	 * @param escudo Nombre del archivo del escudo del CENAD
	 */
	public void setEscudo(String escudo) {
		this.escudo = escudo;
	}

	/**
	 * Devuelve el nombre del archivo de la imagen del mapa del CENAD
	 * @return Devuelve el nombre del archivo de la imagen del mapa del CENAD
	 */
	public String getInfoCenad() {
		return infoCenad;
	}

	/**
	 * Guarda el nombre del archivo de la imagen del mapa del CENAD
	 * @param escudo Nombre del archivo de la imagen del mapa del CENAD
	 */
	public void setInfoCenad(String infoCenad) {
		this.infoCenad = infoCenad;
	}
	
	/**
	 * Devuelve las categorias del CENAD
	 * @return Devuelve las categorias del CENAD
	 */
	public Collection<Categoria> getCategorias() {
		return categorias;
	}
	
	/**
	 * Guarda las categorias del CENAD
	 * @param categorias Categorias del CENAD
	 */
	public void setCategorias(Collection<Categoria> categorias) {
		this.categorias = categorias;
	}
	
	/**
	 * Devuelve los conjuntos cartograficos del CENAD
	 * @return Devuelve los conjuntos cartograficos del CENAD
	 */
	public Collection<Cartografia> getCartografias() {
		return cartografias;
	}
	
	/**
	 * Guarda los conjuntos cartograficos del CENAD
	 * @param cartografias Conjuntos cartograficos del CENAD
	 */
	public void setCartografias(Collection<Cartografia> cartografias) {
		this.cartografias = cartografias;
	}
	
	/**
	 * Devuelve las normativas del CENAD
	 * @return Devuelve las normativas del CENAD
	 */
	public Collection<Fichero> getNormativas() {
		return normativas;
	}
	
	/**
	 * Guarda las normativas del CENAD
	 * @param normativas Normativas del CENAD
	 */
	public void setNormativas(Collection<Fichero> normativas) {
		this.normativas = normativas;
	}
	
	/**
	 * Devuelve los gestores del CENAD
	 * @return Devuelve los gestores del CENAD
	 */
	public Collection<UsuarioGestor> getUsuariosGestores() {
		return usuariosGestores;
	}
	
	/**
	 * Guarda los gestores del CENAD
	 * @param usuariosGestores Gestores del CENAD
	 */
	public void setUsuariosGestores(Collection<UsuarioGestor> usuarios) {
		this.usuariosGestores = usuarios;
	}
	
	/**
	 * Devuelve el administrador de un CENAD
	 * @return Devuelve el administrador del CENAD
	 */
	public UsuarioAdministrador getUsuarioAdministrador() {
		return usuarioAdministrador;
	}
	
	/**
	 * Guarda el administrador del CENAD
	 * @param usuarioAdministrador Administrador del CENAD
	 */
	public void setUsuarioAdministrador(UsuarioAdministrador usuarioAdministrador) {
		this.usuarioAdministrador = usuarioAdministrador;
	}
	
	// Establece la relacion en los dos sentidos
	/**
	 * Agrega la categoria al CENAD
	 * @param categoria Categoria agregada al CENAD
	 */
	public void addCategoria(Categoria categoria) {
		getCategorias().add(categoria);
		categoria.setCenad(this);
	}
	
	/**
	 * Agrega el conjunto cartografico al CENAD
	 * @param cartografia Conjunto cartografico agregado al CENAD
	 */
	public void addCartografia(Cartografia cartografia) {
		getCartografias().add(cartografia);
		cartografia.setCenad(this);
	}
	
	/**
	 * Agrega las normativas al CENAD
	 * @param normativa CNormativa agregada al CENAD
	 */
	public void addNormativa(Fichero normativa) {
		getNormativas().add(normativa);
		normativa.setCenad(this);
	}
	
	/**
	 * Agrega un gestor al CENAD
	 * @param usuario Gestor agregado al CENAD
	 */
	public void addUsuarioGestor(UsuarioGestor usuario) {
		getUsuariosGestores().add(usuario);
		usuario.setCenad(this);
	}
}