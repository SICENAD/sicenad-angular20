package es.mde.security.exceptionHandler_JwtAuthenticationFilter;

import org.springframework.http.HttpStatus;

public class ExcepcionResponse {

	private String mensaje;
	private HttpStatus estado;
	private String broma = "No hagas el calamar y manda una request en condiciones...";
	
	public ExcepcionResponse(String mensaje, HttpStatus estado) {
		this.mensaje = mensaje;
		this.estado = estado;
	}

	public String getMensaje() {
		return mensaje;
	}

	public void setMensaje(String mensaje) {
		this.mensaje = mensaje;
	}

	public HttpStatus getEstado() {
		return estado;
	}

	public void setEstado(HttpStatus estado) {
		this.estado = estado;
	}
	
	public String getBroma() {
		return broma;
	}
	public void setBroma(String broma) {
		this.broma = broma;
	}
}
