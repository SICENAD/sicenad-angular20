package es.mde.security.usuarios;


import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Representa los usuarios de la aplicacion
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name="USUARIOS", uniqueConstraints = {@UniqueConstraint(columnNames = {"username"})})
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "TIPO")
@DiscriminatorValue("U")
public class Usuario implements UserDetails {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
	@Enumerated(EnumType.STRING)
	private Rol rol;	
	private String username;
	private String password;
	private String email;
	private String tfno;
	private String descripcion;
	private boolean emailAdmitido;

	/**
	 * Crea un usuario
	 */
	public Usuario() {
		super();
	}

	/**
	 * Devuelve el id de un usuario
	 * 
	 * @return Devuelve el id del usuario
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el id del usuario
	 * 
	 * @param id Id del usuario
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id del usuario
	 * @return Devuelve el id del usuario
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id del usuario
	 * @param idString Guarda el id del usuario
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}
	
	/**
	 * Devuelve el rol del usuario
	 * 
	 * @return Devuelve el rol del usuario
	 */
	public Rol getRol () {
		return rol;
	}
	
	/**
	 * Guarda el rol del usuario
	 * 
	 * @param rol Rol del usuario
	 */
	public void setRol(Rol rol) {
		this.rol = rol;
	}

	/**
	 * Devuelve el username del usuario
	 * 
	 * @return Devuelve el username del usuario
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * Guarda el username del usuario
	 * 
	 * @param nombre username del usuario
	 */
	public void setUsername(String username) {
		this.username = username;
	}

	/**
	 * Devuelve el password del usuario
	 * @return Devuelve el password del usuario
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * Guarda el password del usuario
	 * @param password Password del usuario
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * Devuelve el email del usuario
	 * @return Devuelve el email del usuario
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * Guarda el email del usuario
	 * @param email Email del usuario
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * Devuelve el telefono del usuario
	 * @return Devuelve el telefono del usuario
	 */
	public String getTfno() {
		return tfno;
	}

	/**
	 * Guarda el telefono del usuario
	 * @param tfno Telefono del usuario
	 */
	public void setTfno(String tfno) {
		this.tfno = tfno;
	}

	/**
	 * Devuelve la descripcion del usuario
	 * @return Devuelve la descripcion del usuario
	 */
	public String getDescripcion() {
		return descripcion;
	}

	/**
	 * Guarda la descripcion del usuario
	 * @param descripcion Descripcion del usuario
	 */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}
	
	/**
	 * Devuelve un boolean que le permitirá recibir emails o no
	 * @return Devuelve un boolean que le permitirá recibir emails o no
	 */
	public boolean isEmailAdmitido() {
		return emailAdmitido;
	}
	
	/**
	 * Guarda un boolean que le permitirá recibir emails o no
	 * @param emailAdmitido Variable boolean que le permitirá recibir emails o no
	 */
	public void setEmailAdmitido(boolean emailAdmitido) {
		this.emailAdmitido = emailAdmitido;
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority((rol.name())));
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;

	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;

	}
	@Override
	public boolean isEnabled() {
		return true;
	}
}