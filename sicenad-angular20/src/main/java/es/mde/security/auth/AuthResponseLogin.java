package es.mde.security.auth;

import es.mde.security.usuarios.Rol;

public class AuthResponseLogin {

	private String token;
	private String username;
	private Rol rol;

	public AuthResponseLogin() {
	}

	public AuthResponseLogin(String token, String username, Rol rol) {
		this.token = token;
		this.username = username;
		this.rol = rol;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
	public Rol getRol() {
		return rol;
	}
	
	public void setRol(Rol rol) {
		this.rol = rol;
	}

}
