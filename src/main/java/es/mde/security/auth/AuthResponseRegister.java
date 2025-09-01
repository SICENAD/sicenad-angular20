package es.mde.security.auth;

import es.mde.security.usuarios.Rol;

public class AuthResponseRegister {

	private String usernameRegistrado;
	private String rolRegistrado;

	public AuthResponseRegister() {
	}

	public AuthResponseRegister(String usernameRegistrado, String rolRegistrado) {
		this.usernameRegistrado = usernameRegistrado;
		this.rolRegistrado = rolRegistrado;
	}

	public String getUsernameRegistrado() {
		return usernameRegistrado;
	}

	public void setUsernameRegistrado(String usernameRegistrado) {
		this.usernameRegistrado = usernameRegistrado;
	}

	public String getRolRegistrado() {
		return rolRegistrado;
	}

	public void setRolRegistrado(String rolRegistrado) {
		this.rolRegistrado = rolRegistrado;
	}	
}
