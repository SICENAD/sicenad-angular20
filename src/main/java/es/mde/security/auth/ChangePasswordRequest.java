package es.mde.security.auth;

public class ChangePasswordRequest {

	private String idUsuario;
	private String password;
	
	public ChangePasswordRequest() {}

	public ChangePasswordRequest(String idUsuario, String password) {
		super();
		this.idUsuario = idUsuario;
		this.password = password;	
	}

	public String getIdUsuario() {
		return idUsuario;
	}
	
	public void setIdUsuario(String idUsuario) {
		this.idUsuario = idUsuario;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
}
