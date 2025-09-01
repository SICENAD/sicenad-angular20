package es.mde.servicios;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interfaz del servicio encargado del almacenamiento de archivos
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
public interface FileServiceAPI {
	// *******************************
	// Métodos para tratar los escudos
	// *******************************

	/**
	 * Metodo para guardar un escudo
	 * 
	 * @param file Archivo de imagen del escudo
	 * @throws Exception
	 */
	public String saveEscudo(MultipartFile file, String id) throws Exception;

	/**
	 * Metodo para borrar un escudo
	 * 
	 * @param name Nombre del archivo de imagen del escudo
	 * @param id   Id del cenad
	 * @throws Exception
	 */
	public String borrarEscudo(String name, String id) throws Exception;

	/**
	 * Metodo para borrar la carpeta de escudos de un CENAD
	 * 
	 * @param id   Id del cenad
	 * @throws Exception
	 */
	public String borrarCarpetaEscudo(String id) throws Exception;


	/**
	 * Metodo para cargar un escudo
	 * 
	 * @param name Nombre del archivo de imagen del escudo
	 * @param id   Id del cenad
	 * @throws Exception
	 */
	public Resource loadEscudo(String name, String id) throws Exception;

	// *********************************************************
	// Métodos para tratar los ficheros asociados a los recursos
	// *********************************************************

	/**
	 * Metodo para guardar un archivo de un recurso
	 * 
	 * @param file Archivo a subir
	 * @param idCenad   Id del cenad
	 * @param id   Id del recurso
	 * @throws Exception
	 */
	public String saveDocRecurso(MultipartFile file, String idCenad, String id) throws Exception;

	/**
	 * Metodo para borrar un archivo de un recurso
	 * 
	 * @param name Nombre del archivo
	 * @param idCenad   Id del cenad
	 * @param id   Id del recurso
	 * @throws Exception
	 */
	public String borrarDocRecurso(String name, String idCenad, String id) throws Exception;

	/**
	 * Metodo para borrar la carpeta de un recurso
	 * 
	 * @param idCenad   Id del cenad
	 * @param id   Id del recurso
	 * @throws Exception
	 */
	public String borrarCarpetaDocRecurso(String idCenad, String id) throws Exception;

	/**
	 * Metodo para cargar un archivo de un recurso
	 * 
	 * @param name Nombre del archivo
	 * @param idCenad   Id del cenad
	 * @param id   Id del recurso
	 * @throws Exception
	 */
	public Resource loadDocRecurso(String name, String idCenad, String id) throws Exception;


	/**
	 * Metodo para guardar varios archivos de un recurso
	 * 
	 * @param files Lista de archivos a subir
	 * @param idCenad   Id del cenad
	 * @param id   Id del recurso	 
	 * @throws Exception
	 */
	public String saveDocRecursos(List<MultipartFile> files, String idCenad, String id) throws Exception;

	/**
	 * Metodo para cargar varios archivos de un recurso
	 * 
	 * @param idCenad   Id del cenad
	 * @param id   Id del recurso
	 * @throws Exception
	 */
	public Stream<Path> loadAllDocRecursos(String idCenad, String id) throws Exception;

	// ************************************************************
	// Métodos para tratar los ficheros asociados a las solicitudes
	// ************************************************************

	/**
	 * Metodo para guardar un archivo de una solicitud
	 * 
	 * @param file Archivo a subir
	 * @param id   Id de la solicitud
	 * @throws Exception
	 */
	public String saveDocSolicitud(MultipartFile file, String idCenad, String id) throws Exception;

	/**
	 * Metodo para borrar un archivo de una solicitud
	 * 
	 * @param name Nombre del archivo
	 * @param idCenad   Id del cenad
	 * @param id   Id de la solicitud
	 * @throws Exception
	 */
	public String borrarDocSolicitud(String name, String idCenad, String id) throws Exception;

	/**
	 * Metodo para borrar la carpeta de una solicitud
	 * 
	 * @param idCenad   Id del cenad
	 * @param id   Id de la solicitud
	 * @throws Exception
	 */
	public String borrarCarpetaDocSolicitud(String idCenad, String id) throws Exception;

	/**
	 * Metodo para cargar un archivo de una solicitud
	 * 
	 * @param name Nombre del archivo
	 * @param idCenad   Id del cenad
	 * @param id   Id de la solicitud
	 * @throws Exception
	 */
	public Resource loadDocSolicitud(String name, String idCenad, String id) throws Exception;


	/**
	 * Metodo para guardar varios archivos de una solicitud
	 * 
	 * @param files Lista de archivos a subir
	 * @param idCenad   Id del cenad
	 * @param id   Id de la solicitud
	 * @throws Exception
	 */
	public String saveDocSolicitudes(List<MultipartFile> files, String idCenad, String id) throws Exception;

	/**
	 * Metodo para cargar varios archivos de una solicitud
	 * 
	 * @param idCenad   Id del cenad
	 * @param id   Id de la solicitud
	 * @throws Exception
	 */
	public Stream<Path> loadAllDocSolicitudes(String idCenad, String id) throws Exception;

	// *******************************
	// Métodos para tratar las cartografías
	// *******************************

	/**
	 * Metodo para guardar un archivo de un conjunto cartografico
	 * 
	 * @param file Archivo a subir
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public String saveCartografia(MultipartFile file, String id) throws Exception;

	/**
	 * Metodo para borrar un archivo de un conjunto cartografico
	 * 
	 * @param name Nombre del archivo
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public String borrarCartografia(String name, String id) throws Exception;

	/**
	 * Metodo para borrar la carpeta de un conjunto cartografico
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public String borrarCarpetaCartografia(String id) throws Exception;

	/**
	 * Metodo para cargar un archivo de un conjunto cartografico
	 * 
	 * @param name Nombre del archivo
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public Resource loadCartografia(String name, String id) throws Exception;

	/**
	 * Metodo para guardar varios archivos de un conjunto cartografico
	 * 
	 * @param files Lista de archivos a subir
	 * @param id    Id del CENAD
	 * @throws Exception
	 */
	public String saveCartografias(List<MultipartFile> files, String id) throws Exception;

	/**
	 * Metodo para cargar varios archivos de un conjunto cartografico
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public Stream<Path> loadAllCartografias(String id) throws Exception;

	// *******************************
	// Métodos para tratar las normativas
	// *******************************

	/**
	 * Metodo para guardar un archivo de una normativa
	 * 
	 * @param file Archivo a subir
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public String saveNormativa(MultipartFile file, String id) throws Exception;

	/**
	 * Metodo para borrar un archivo de normativa
	 * 
	 * @param name Nombre del archivo
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public String borrarNormativa(String name, String id) throws Exception;

	/**
	 * Metodo para borrar la carpeta de normativa de un CENAD
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public String borrarCarpetaNormativa(String id) throws Exception;

	/**
	 * Metodo para cargar un archivo de normativa
	 * 
	 * @param name Nombre del archivo
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public Resource loadNormativa(String name, String id) throws Exception;

	/**
	 * Metodo para guardar varios archivos de normativa
	 * 
	 * @param files Lista de archivos a subir
	 * @param id    Id del CENAD
	 * @throws Exception
	 */
	public String saveNormativas(List<MultipartFile> files, String id) throws Exception;

	/**
	 * Metodo para cargar varios archivos de normativa
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public Stream<Path> loadAllNormativas(String id) throws Exception;

	// *******************************
	// Métodos para tratar las imagenes de InfoCenad
	// *******************************

	/**
	 * Metodo para guardar un archivo de información del CENAD
	 * 
	 * @param file Archivo a subir
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public String saveInfoCenad(MultipartFile file, String id) throws Exception;

	/**
	 * Metodo para borrar un archivo de información del CENAD
	 * 
	 * @param name Nombre del archivo
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public String borrarInfoCenad(String name, String id) throws Exception;

	/**
	 * Metodo para borrar la carpeta de información del CENAD
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public String borrarCarpetaInfoCenad(String id) throws Exception;

	/**
	 * Metodo para cargar un archivo de información del CENAD
	 * 
	 * @param name Nombre del archivo
	 * @param id   Id del CENAD
	 * @throws Exception
	 */
	public Resource loadInfoCenad(String name, String id) throws Exception;

	/**
	 * Metodo para guardar varios archivos de información del CENAD
	 * 
	 * @param files Lista de archivos a subir
	 * @param id    Id del CENAD
	 * @throws Exception
	 */
	public String saveInfoCenads(List<MultipartFile> files, String id) throws Exception;

	/**
	 * Metodo para cargar varios archivos de información del CENAD
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public Stream<Path> loadAllInfoCenads(String id) throws Exception;
	
	/**
	 * Metodo para borrar la carpeta entera del CENAD
	 * 
	 * @param id Id del CENAD
	 * @throws Exception
	 */
	public String borrarCarpetaCenad(String id) throws Exception;
}