package es.mde.models;

/**
 * Response representará la respuesta de la API
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public class Response {
	private String message;

	/**
	 * Crea la respuesta con un mensaje.
	 * @param message Texto de la respuesta
	 */
	public Response(String message) {
		super();
		this.message = message;
	}
	
	/**
	 * Devuelve el mensaje
	 * @return Devuelve el mensaje
	 */
	public String getMessage() {
		return message;
	}

	/**
	 * Guarda el mensaje
	 * @param message Texto de la respuesta
	 */
	public void setMessage(String message) {
		this.message = message;
	}
}