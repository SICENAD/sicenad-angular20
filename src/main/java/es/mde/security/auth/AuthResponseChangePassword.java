package es.mde.security.auth;

public class AuthResponseChangePassword {

	private String username;
	private String rol;

	public AuthResponseChangePassword() {
	}

	public AuthResponseChangePassword(String username, String rol) {
		this.username = username;
		this.rol = rol;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getRol() {
		return rol;
	}

	public void setRol(String rol) {
		this.rol = rol;
	}
}
