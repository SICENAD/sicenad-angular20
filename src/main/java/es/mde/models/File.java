package es.mde.models;

/**
 * File representará el archivo que se guarda en el servidor
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public class File {
	private String name;
	private String url;
	
	/**
	 * Crea un archivo, con nombre y url
	 * @param name Nombre del archivo
	 * @param url URL del archivo
	 */
	public File(String name, String url) {
		super();
		this.name = name;
		this.url = url;
	}
	
	/**
	 * Devuelve el nombre de un archivo
	 * @return Devuelve el nombre del archivo
	 */
	public String getName() {
		return name;
	}
	
	/**
	 * Guarda el nombre de un archivo
	 * @param name Nombre del archivo
	 */
	public void setName(String name) {
		this.name = name;
	}
	
	/**
	 * Devuelve la URL de un archivo
	 * @return Devuelve la URL del archivo
	 */
	public String getUrl() {
		return url;
	}
	
	/**
	 * Guarda la URL de un archivo
	 * @param url URL del archivo
	 */
	public void setUrl(String url) {
		this.url = url;
	}
}