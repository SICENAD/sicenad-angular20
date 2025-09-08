package es.mde.rest;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import es.mde.models.File;
import es.mde.models.Response;
import es.mde.servicios.FileServiceAPI;

/**
 * Controlador encargado del almacenamiento de archivos
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@RestController
//@RequestMapping("/api/files")
public class FileController {
	private static long sizeLimiteEscudo = 5 * 1024 * 1024; // 5MB
	private static long sizeLimiteDocRecurso = 6 * 1024 * 1024; // 6MB
	private static long sizeLimiteDocSolicitud = 7 * 1024 * 1024; // 7MB

	/**
	 * Constructor que me permite modificar los tamaños permitidos para la carga de
	 * archivos sin necesidad de tocar codigo
	 * 
	 * @param sizeLimiteEscudo       Limite de los archivos de imagen
	 * @param sizeLimiteDocRecurso   Limite de los archivos relacionados con los
	 *                               recursos (para imagenes se tendra en cuenta el
	 *                               limite de escudos)
	 * @param sizeLimiteDocSolicitud Limite de los archivos relacionados con las
	 *                               solicitudes (para imagenes se tendra en cuenta
	 *                               el limite de escudos) EL limite de cartografias
	 *                               lo defino en el properties como Size max de
	 *                               spring...
	 */
	@Autowired
	public FileController(@Qualifier("sizeLimiteEscudo") long sizeLimiteEscudo,
			@Qualifier("sizeLimiteDocRecurso") long sizeLimiteDocRecurso,
			@Qualifier("sizeLimiteDocSolicitud") long sizeLimiteDocSolicitud) {
		FileController.sizeLimiteEscudo = sizeLimiteEscudo;
		FileController.sizeLimiteDocRecurso = sizeLimiteDocRecurso;
		FileController.sizeLimiteDocSolicitud = sizeLimiteDocSolicitud;
	}

	@Autowired
	private FileServiceAPI fileServiceAPI;
	

	// ******************************
	// Métodos para subir los escudos
	// ******************************

	/**
	 * Genera el endpoint para subir el archivo de un escudo
	 * 
	 * @param file Archivo a subir
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirEscudo")
	public ResponseEntity<Map<String, String>> uploadFileEscudo(@RequestParam("file") MultipartFile file, @PathVariable("idCenad") String id)
			throws Exception {
		if (file.getSize() > sizeLimiteEscudo) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(Map.of("error", "El archivo es demasiado pesado"));
		} else {
			String nombreArchivo = fileServiceAPI.saveEscudo(file, id);
			return ResponseEntity.ok(Map.of("nombreArchivo", nombreArchivo));
		}
	}

	/**
	 * Genera el endpoint para borrar el archivo de un escudo
	 * 
	 * @param filename Nombre del archivo
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarEscudo/{filename:.+}")
	public ResponseEntity<Response> borrarFileEscudo(@PathVariable String filename, @PathVariable("idCenad") String id) throws Exception {
		String nombreArchivo = fileServiceAPI.borrarEscudo(filename, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("El archivo " + nombreArchivo + " fue borrado correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para borrar la carpeta de escudos de un Cenad
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaEscudo")
	public ResponseEntity<Response> borrarCarpetaEscudo(@PathVariable("idCenad") String id) throws Exception {
		fileServiceAPI.borrarCarpetaEscudo(id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta de escudo del CENAD fue borrada correctamente del servidor"));
	}
	
	/**
	 * Genera el endpoint para cargar el archivo de un escudo
	 * 
	 * @param filename Nombre del archivo
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/escudo/{filename:.+}")
	public ResponseEntity<Resource> getFileEscudo(@PathVariable String filename, @PathVariable("idCenad") String id) throws Exception {
		Resource resource = fileServiceAPI.loadEscudo(filename, id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}

	// *********************************************************
	// Métodos para tratar los ficheros asociados a los recursos
	// *********************************************************

	/**
	 * Genera el endpoint para subir varios archivos de un recurso
	 * 
	 * @param files Archivos a subir
	 * @param id    Id del recurso
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirDocRecursos/{id}")
	public ResponseEntity<Response> uploadFileDocRecursos(@RequestParam("files") List<MultipartFile> files, @PathVariable("idCenad") String idCenad,
			@PathVariable("id") String id) throws Exception {
		long filesSize = 0;
		for (MultipartFile multipartFile : files) {
			filesSize += multipartFile.getSize();
		}
		if (filesSize > sizeLimiteDocRecurso) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(new Response("Los archivos pesan demasiado"));
		} else {
			fileServiceAPI.saveDocRecursos(files, idCenad, id);
			return ResponseEntity.status(HttpStatus.OK)
					.body(new Response("Los archivos fueron cargados correctamente al servidor"));
		}
	}

	/**
	 * Genera el endpoint para subir un archivo de un recurso
	 * 
	 * @param file Archivo a subir
	 * @param id   Id del recurso
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirDocRecurso/{id}")
	public ResponseEntity<Map<String, String>> uploadFileDocRecurso(@RequestParam("file") MultipartFile file, @PathVariable("idCenad") String idCenad,
			@PathVariable("id") String id) throws Exception {
		if (file.getSize() > sizeLimiteDocRecurso) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(Map.of("error", "El archivo es demasiado pesado"));
		} else {
			String nombreArchivo = fileServiceAPI.saveDocRecurso(file, idCenad, id);
			return ResponseEntity.ok(Map.of("nombreArchivo", nombreArchivo));
		}
	}

	/**
	 * Genera el endpoint para borrar un archivo de un recurso
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del recurso
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarDocRecurso/{id}/{filename:.+}")
	public ResponseEntity<Response> borrarFileDocRecurso(@PathVariable String filename, @PathVariable("idCenad") String idCenad, @PathVariable("id") String id)
			throws Exception {
		fileServiceAPI.borrarDocRecurso(filename, idCenad, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("El archivo fue borrado correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para borrar la carpeta de un recurso
	 * 
	 * @param id Id del recurso
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaDocRecurso/{id}")
	public ResponseEntity<Response> borrarCarpetaDocRecurso(@PathVariable("idCenad") String idCenad,@PathVariable("id") String id) throws Exception {

		fileServiceAPI.borrarCarpetaDocRecurso(idCenad, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta del recurso fue borrada correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para cargar un archivo de un recurso
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del recurso
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/docRecursos/{id}/{filename:.+}")
	public ResponseEntity<Resource> getFileDocRecurso(@PathVariable String filename, @PathVariable("idCenad") String idCenad, @PathVariable("id") String id)
			throws Exception {
		Resource resource = fileServiceAPI.loadDocRecurso(filename, idCenad, id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}

	/**
	 * Genera el endpoint para cargar los archivos de un recurso
	 * 
	 * @param id Id del recurso
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/docRecursos/{id}/all")
	public ResponseEntity<List<File>> getAllFilesDocRecursos(@PathVariable("idCenad") String idCenad,@PathVariable("id") String id) throws Exception {
		List<File> files = fileServiceAPI.loadAllDocRecursos(idCenad, id).map(path -> {
			String filename = path.getFileName().toString();
			String url = MvcUriComponentsBuilder
					.fromMethodName(FileController.class, "getFileDocRecurso", path.getFileName().toString()).build()
					.toString();
			return new File(filename, url);
		}).collect(Collectors.toList());
		return ResponseEntity.status(HttpStatus.OK).body(files);
	}

	// ************************************************************
	// Métodos para tratar los ficheros asociados a las solicitudes
	// ************************************************************

	/**
	 * Genera el endpoint para subir varios archivos de una solicitud
	 * 
	 * @param files Archivos a subir
	 * @param id    Id de la solicitud
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirDocSolicitudes/{id}")
	public ResponseEntity<Response> uploadFileDocSolicitudes(@RequestParam("files") List<MultipartFile> files, @PathVariable("idCenad") String idCenad,
			@PathVariable("id") String id) throws Exception {
		long filesSize = 0;
		for (MultipartFile multipartFile : files) {
			filesSize += multipartFile.getSize();
		}
		if (filesSize > sizeLimiteDocSolicitud) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(new Response("Los archivos pesan demasiado"));
		} else {
			fileServiceAPI.saveDocSolicitudes(files, idCenad, id);
			return ResponseEntity.status(HttpStatus.OK)
					.body(new Response("Los archivos fueron cargados correctamente al servidor"));
		}
	}

	/**
	 * Genera el endpoint para subir un archivo de una solicitud
	 * 
	 * @param file Archivo a subir
	 * @param id   Id de la solicitud
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirDocSolicitud/{id}")
	public ResponseEntity<Map<String, String>> uploadFileDocSolicitud(@RequestParam("file") MultipartFile file, @PathVariable("idCenad") String idCenad,
			@PathVariable("id") String id) throws Exception {
		if (file.getSize() > sizeLimiteDocSolicitud) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(Map.of("error", "El archivo es demasiado pesado"));
		} else {
			String nombreArchivo = fileServiceAPI.saveDocSolicitud(file, idCenad, id);
			return ResponseEntity.ok(Map.of("nombreArchivo", nombreArchivo));
		}
	}

	/**
	 * Genera el endpoint para borrar un archivo de una solicitud
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id de la solicitud
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarDocSolicitud/{id}/{filename:.+}")
	public ResponseEntity<Response> borrarFileDocSolicitud(@PathVariable String filename, @PathVariable("idCenad") String idCenad, @PathVariable("id") String id)
			throws Exception {
		fileServiceAPI.borrarDocSolicitud(filename, idCenad, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("El archivo fue borrado correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para borrar la carpeta de una solicitud
	 * 
	 * @param id Id de la solicitud
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaDocSolicitud/{id}")
	public ResponseEntity<Response> borrarCarpetaDocSolicitud(@PathVariable("idCenad") String idCenad,@PathVariable("id") String id) throws Exception {
		fileServiceAPI.borrarCarpetaDocSolicitud(idCenad, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta de la solicitud fue borrada correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para cargar un archivo de una solicitud
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id de la solicitud
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/docSolicitudes/{id}/{filename:.+}")
	public ResponseEntity<Resource> getFileDocSolicitud(@PathVariable("idCenad") String idCenad,@PathVariable String filename, @PathVariable("id") String id)
			throws Exception {
		Resource resource = fileServiceAPI.loadDocSolicitud(filename,idCenad, id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}

	/**
	 * Genera el endpoint para cargar los archivos de una solicitud
	 * 
	 * @param id Id de la solicitud
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/docSolicitudes/{id}/all")
	public ResponseEntity<List<File>> getAllFilesDocSolicitud(@PathVariable("idCenad") String idCenad,@PathVariable("id") String id) throws Exception {
		List<File> files = fileServiceAPI.loadAllDocSolicitudes(idCenad, id).map(path -> {
			String filename = path.getFileName().toString();
			String url = MvcUriComponentsBuilder
					.fromMethodName(FileController.class, "getFileDocSolicitud", path.getFileName().toString()).build()
					.toString();
			return new File(filename, url);
		}).collect(Collectors.toList());
		return ResponseEntity.status(HttpStatus.OK).body(files);
	}

	// ************************************************************
	// Métodos para tratar los ficheros asociados a las cartografias
	// ************************************************************

	/**
	 * Genera el endpoint para subir varios archivos de un conjunto cartografico
	 * 
	 * @param files Archivos a subir
	 * @param id    Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirCartografias")
	public ResponseEntity<Response> uploadFileCartografias(@RequestParam("files") List<MultipartFile> files,
			@PathVariable("idCenad") String id) throws Exception {
		fileServiceAPI.saveCartografias(files, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("Los archivos fueron cargados correctamente al servidor"));
	}

	/**
	 * Genera el endpoint para subir un archivo de un conjunto cartografico
	 * 
	 * @param file Archivo a subir
	 * @param id   Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirCartografia")
	public ResponseEntity<Map<String, String>> uploadFileCartografia(@RequestParam("file") MultipartFile file,
			@PathVariable("idCenad") String id) throws Exception {
		String nombreArchivo = fileServiceAPI.saveCartografia(file, id);
		return ResponseEntity.ok(Map.of("nombreArchivo", nombreArchivo));
	}

	/**
	 * Genera el endpoint para borrar un archivo de un conjunto cartografico
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCartografia/{filename:.+}")
	public ResponseEntity<Response> borrarFileCartografia(@PathVariable String filename, @PathVariable("idCenad") String id)
			throws Exception {
		fileServiceAPI.borrarCartografia(filename, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("El archivo fue borrado correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para borrar la carpeta de un conjunto cartografico
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaCartografia")
	public ResponseEntity<Response> borrarCarpetaCartografia(@PathVariable("idCenad") String id) throws Exception {
		fileServiceAPI.borrarCarpetaCartografia(id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta de la cartografía fue borrada correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para cargar un archivo de un conjunto cartografico
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/cartografias/{filename:.+}")
	public ResponseEntity<Resource> getFileCartografia(@PathVariable String filename, @PathVariable("idCenad") String id)
			throws Exception {
		Resource resource = fileServiceAPI.loadCartografia(filename, id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}

	/**
	 * Genera el endpoint para cargar los archivos de un conjunto cartografico
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/cartografias/all")
	public ResponseEntity<List<File>> getAllFilesCartografia(@PathVariable("idCenad") String id) throws Exception {
		List<File> files = fileServiceAPI.loadAllCartografias(id).map(path -> {
			String filename = path.getFileName().toString();
			String url = MvcUriComponentsBuilder
					.fromMethodName(FileController.class, "getFileCartografia", path.getFileName().toString()).build()
					.toString();
			return new File(filename, url);
		}).collect(Collectors.toList());
		return ResponseEntity.status(HttpStatus.OK).body(files);
	}

	// ************************************************************
	// Métodos para tratar los ficheros asociados a las normativas
	// ************************************************************

	/**
	 * Genera el endpoint para subir varios archivos de una normativa
	 * 
	 * @param files Archivos a subir
	 * @param id    Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirNormativas")
	public ResponseEntity<Response> uploadFileNormativas(@RequestParam("files") List<MultipartFile> files,
			@PathVariable("idCenad") String id) throws Exception {
		long filesSize = 0;
		for (MultipartFile multipartFile : files) {
			filesSize += multipartFile.getSize();
		}
		if (filesSize > sizeLimiteDocRecurso) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(new Response("Los archivos pesan demasiado"));
		} else {
			fileServiceAPI.saveNormativas(files, id);
			return ResponseEntity.status(HttpStatus.OK)
					.body(new Response("Los archivos fueron cargados correctamente al servidor"));
		}
	}

	/**
	 * Genera el endpoint para subir un archivo de una normativa
	 * 
	 * @param file Archivo a subir
	 * @param id   Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirNormativa")
	public ResponseEntity<Map<String, String>> uploadFileNormativa(@RequestParam("file") MultipartFile file,
			@PathVariable("idCenad") String id) throws Exception {
	    if (file.getSize() > sizeLimiteDocRecurso) {
	        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
	                .body(Map.of("error", "El archivo es demasiado pesado"));
	    } else {
	        String nombreArchivo = fileServiceAPI.saveNormativa(file, id);
	        return ResponseEntity.ok(Map.of("nombreArchivo", nombreArchivo));
	    }
	}

	/**
	 * Genera el endpoint para borrar un archivo de una normativa
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarNormativa/{filename:.+}")
	public ResponseEntity<Response> borrarFileNormativa(@PathVariable String filename, @PathVariable("idCenad") String id)
			throws Exception {
		fileServiceAPI.borrarNormativa(filename, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("El archivo fue borrado correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para borrar la carpeta de una normativa
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaNormativa")
	public ResponseEntity<Response> borrarCarpetaNormativa(@PathVariable("idCenad") String id) throws Exception {
		fileServiceAPI.borrarCarpetaNormativa(id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta de la normativa fue borrada correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para cargar un archivo de una normativa
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/normativas/{filename:.+}")
	public ResponseEntity<Resource> getFileNormativa(@PathVariable String filename, @PathVariable("idCenad") String id)
			throws Exception {
		Resource resource = fileServiceAPI.loadNormativa(filename, id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}

	/**
	 * Genera el endpoint para cargar los archivos de una normativa
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/normativas/all")
	public ResponseEntity<List<File>> getAllFilesNormativa(@PathVariable("idCenad") String id) throws Exception {
		List<File> files = fileServiceAPI.loadAllNormativas(id).map(path -> {
			String filename = path.getFileName().toString();
			String url = MvcUriComponentsBuilder
					.fromMethodName(FileController.class, "getFileNormativa", path.getFileName().toString()).build()
					.toString();
			return new File(filename, url);
		}).collect(Collectors.toList());
		return ResponseEntity.status(HttpStatus.OK).body(files);
	}

	// ************************************************************
	// Métodos para tratar los ficheros asociados a infoCenads
	// ************************************************************

	/**
	 * Genera el endpoint para subir varios archivos de infoCenads
	 * 
	 * @param files Archivos a subir
	 * @param id    Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirInfoCenads")
	public ResponseEntity<Response> uploadFileInfoCenads(@RequestParam("files") List<MultipartFile> files,
			@PathVariable("idCenad") String id) throws Exception {
		long filesSize = 0;
		for (MultipartFile multipartFile : files) {
			filesSize += multipartFile.getSize();
		}
		if (filesSize > sizeLimiteEscudo) {
			return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
					.body(new Response("Los archivos pesan demasiado"));
		} else {
			fileServiceAPI.saveInfoCenads(files, id);
			return ResponseEntity.status(HttpStatus.OK)
					.body(new Response("Los archivos fueron cargados correctamente al servidor"));
		}
	}

	/**
	 * Genera el endpoint para subir un archivo de infoCenads
	 * 
	 * @param file Archivo a subir
	 * @param id   Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@PostMapping("/api/files/{idCenad}/subirInfoCenad")
	public ResponseEntity<Map<String, String>> uploadFileInfoCenad(@RequestParam("file") MultipartFile file,
			@PathVariable("idCenad") String id) throws Exception {
	  System.err.println(fileServiceAPI.toString());
		if (file.getSize() > sizeLimiteEscudo) {
	        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
	                .body(Map.of("error", "El archivo es demasiado pesado"));
	    } else {
	        String nombreArchivo = fileServiceAPI.saveInfoCenad(file, id);
	        return ResponseEntity.ok(Map.of("nombreArchivo", nombreArchivo));
	    }
	}

	/**
	 * Genera el endpoint para borrar un archivo de infoCenads
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarInfoCenad/{filename:.+}")
	public ResponseEntity<Response> borrarFileInfoCenad(@PathVariable String filename, @PathVariable("idCenad") String id)
			throws Exception {
		fileServiceAPI.borrarInfoCenad(filename, id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La imagen fue borrada correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para borrar la carpeta de infoCenads
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaInfoCenad")
	public ResponseEntity<Response> borrarCarpetaInfoCenad(@PathVariable("idCenad") String id) throws Exception {
		fileServiceAPI.borrarCarpetaInfoCenad(id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta de infoCenad fue borrada correctamente del servidor"));
	}

	/**
	 * Genera el endpoint para cargar un archivo de infoCenads
	 * 
	 * @param filename Nombre del archivo
	 * @param id       Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/infoCenad/{filename:.+}")
	public ResponseEntity<Resource> getFileInfoCenad(@PathVariable String filename, @PathVariable("idCenad") String id)
			throws Exception {
		Resource resource = fileServiceAPI.loadInfoCenad(filename, id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}

	/**
	 * Genera el endpoint para cargar los archivos de infoCenads
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/infoCenads/all")
	public ResponseEntity<List<File>> getAllFilesInfoCenad(@PathVariable("idCenad") String id) throws Exception {
		List<File> files = fileServiceAPI.loadAllInfoCenads(id).map(path -> {
			String filename = path.getFileName().toString();
			String url = MvcUriComponentsBuilder
					.fromMethodName(FileController.class, "getFileInfoCenad", path.getFileName().toString()).build()
					.toString();
			return new File(filename, url);
		}).collect(Collectors.toList());
		return ResponseEntity.status(HttpStatus.OK).body(files);
	}
	
	/**
	 * Genera el endpoint para borrar la carpeta entera de un CENAD/CMT
	 * 
	 * @param id Id del CENAD
	 * @return La respuesta de la API...
	 * @throws Exception
	 */
	@GetMapping("/api/files/{idCenad}/borrarCarpetaCenad")
	public ResponseEntity<Response> borrarCarpetaCenad(@PathVariable("idCenad") String id) throws Exception {
		fileServiceAPI.borrarCarpetaCenad(id);
		return ResponseEntity.status(HttpStatus.OK)
				.body(new Response("La carpeta entera del CENAD/CMT " + id + " fue borrada correctamente del servidor"));
	}
}