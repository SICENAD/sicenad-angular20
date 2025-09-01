package es.mde.security.auth;

import es.mde.security.usuarios.Rol;

public class AuthResponseChangePassword {

	private String mensaje;
	private String rolUsuario;

	public AuthResponseChangePassword() {
	}

	public AuthResponseChangePassword(String mensaje, String rol) {
		this.mensaje = mensaje;
		this.rolUsuario = rol;
	}

	public String getMensaje() {
		return mensaje;
	}

	public void setMensaje(String mensaje) {
		this.mensaje = mensaje;
	}

	public String getRolUsuario() {
		return rolUsuario;
	}

	public void setRolUsuario(String rolUsuario) {
		this.rolUsuario = rolUsuario;
	}
}
