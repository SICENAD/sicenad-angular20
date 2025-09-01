package es.mde.servicios;

import java.io.File;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Crea el servicio para el almacenamiento de archivos
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Service
public class FileServiceImpl implements FileServiceAPI {

	private final Path comunFolder;
	private final Path cenadFolder;
	private final Path escudosFolder;
	private final Path docSolicitudesFolder;
	private final Path docRecursosFolder;
	private final Path cartografiasFolder;
	private final Path normativasFolder;
	private final Path infoCenadsFolder;

	/**
	 * Me permite inyectar valores desde el archivo properties para poder modificar
	 * estos valores sin necesidad de tocar codigo
	 * 
	 * @param rutaComun          Define la ruta común donde se guardarán los
	 *                           archivos
	 * 
	 * @param rutaCenad          Define la ruta común por CENAD
	 * 
	 * @param rutaEscudos        Define la ruta donde se guardaran los escudos de
	 *                           los CENAD,s/CMT,s
	 * @param rutaDocRecursos    Define la ruta donde se guardaran los archivos de
	 *                           los recursos
	 * @param rutaDocSolicitudes Define la ruta donde se guardaran los archivos
	 *                           asociados a solicitudes
	 * @param rutaCartografias   Define la ruta donde se guardaran los distintos
	 *                           conjuntos cartograficos
	 * @param rutaNormativas     Define la ruta donde se guardaran los distintos
	 *                           conjuntos de normativas
	 * @param rutaInfoCenads     Define la ruta donde se guardaran los distintos
	 *                           infoCenads
	 */
	@Autowired
	public FileServiceImpl(@Qualifier("rutaComun") String rutaComun, @Qualifier("rutaCenad") String rutaCenad,
			@Qualifier("rutaEscudos") String rutaEscudos, @Qualifier("rutaDocRecursos") String rutaDocRecursos,
			@Qualifier("rutaDocSolicitudes") String rutaDocSolicitudes,
			@Qualifier("rutaCartografias") String rutaCartografias, @Qualifier("rutaInfoCenads") String rutaInfoCenads,
			@Qualifier("rutaNormativas") String rutaNormativas) {
		this.comunFolder = Paths.get(rutaComun);
		this.cenadFolder = Paths.get(rutaCenad);
		this.escudosFolder = Paths.get(rutaEscudos);
		this.docRecursosFolder = Paths.get(rutaDocRecursos);
		this.docSolicitudesFolder = Paths.get(rutaDocSolicitudes);
		this.cartografiasFolder = Paths.get(rutaCartografias);
		this.normativasFolder = Paths.get(rutaNormativas);
		this.infoCenadsFolder = Paths.get(rutaInfoCenads);
	}

	// *******************************
	// Métodos para tratar los escudos
	// *******************************

	/**
	 * Metodo para almacenar un escudo
	 */
	@Override
	public String saveEscudo(MultipartFile file, String id) throws Exception {
		Path escudosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				escudosFolder.toString());
		Files.createDirectories(escudosFolder2);

		Path destino = escudosFolder2.resolve(file.getOriginalFilename());

		// Sobrescribe si el archivo ya existe
		Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

		return file.getOriginalFilename(); // devuelves el nombre que has decidido usar
	}

	/**
	 * Metodo para borrar un escudo
	 */
	@Override
	public String borrarEscudo(String name, String id) throws Exception {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("El nombre del archivo no puede ser nulo o vacío");
		}
		Path escudosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				escudosFolder.toString());
		Path file = escudosFolder2.resolve(name);
		String nombreArchivo = file.getFileName().toString();

		boolean borrado = Files.deleteIfExists(file);
		if (!borrado) {
			throw new FileNotFoundException("No se encontró el archivo: " + nombreArchivo);
		}

		return nombreArchivo;
	}

	/**
	 * Metodo para borrar la carpeta de escudo de un CENAD
	 */
	@Override
	public String borrarCarpetaEscudo(String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta de Escudo del CENAD " + id;
		Path escudosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id);
		Path carpeta = escudosFolder2.resolve(escudosFolder);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}
		
	/**
	 * Metodo para cargar un escudo
	 */
	@Override
	public Resource loadEscudo(String name, String id) throws Exception {
		Path escudosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				escudosFolder.toString());
		Path file = escudosFolder2.resolve(name);
		Resource resource = new UrlResource(file.toUri());
		return resource;
	}

	// *********************************************************
	// Métodos para tratar los ficheros asociados a los recursos
	// *********************************************************

	/**
	 * Metodo para guardar el archivo de un recurso
	 */
	@Override
	public String saveDocRecurso(MultipartFile file, String idCenad, String id) throws Exception {
		Path docRecursosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docRecursosFolder.toString(), id);
		Files.createDirectories(docRecursosFolder2);
		Path destino = docRecursosFolder2.resolve(file.getOriginalFilename());
		// Sobrescribe si el archivo ya existe
		Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
		return file.getOriginalFilename(); // devuelves el nombre que has decidido usar
	}

	/**
	 * Metodo para borrar el archivo de un recurso
	 */
	@Override
	public String borrarDocRecurso(String name, String idCenad, String id) throws Exception {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("El nombre del archivo no puede ser nulo o vacío");
		}
		Path docRecursosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docRecursosFolder.toString(), id);
		Path file = docRecursosFolder2.resolve(name);
		String nombreArchivo = file.getFileName().toString();

		boolean borrado = Files.deleteIfExists(file);
		if (!borrado) {
			throw new FileNotFoundException("No se encontró el archivo: " + nombreArchivo);
		}
		return nombreArchivo;
	}

	/**
	 * Metodo para borrar la carpeta de un recurso
	 */
	@Override
	public String borrarCarpetaDocRecurso(String idCenad, String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta de Documentos de Recursos " + id;
		Path docRecursosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docRecursosFolder.toString());
		Path carpeta = docRecursosFolder2.resolve(id);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}

	/**
	 * Metodo para cargar el archivo de un recurso
	 */
	@Override
	public Resource loadDocRecurso(String name, String idCenad, String id) throws Exception {
		Path docRecursosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docRecursosFolder.toString(), id);
		Path file = docRecursosFolder2.resolve(name);
		Resource resource = new UrlResource(file.toUri());
		return resource;
	}

	/**
	 * Metodo para guardar varios archivos de un recurso (no se usa por requerir
	 * añadir observaciones individuales a cada fichero)
	 */
	@Override
	public String saveDocRecursos(List<MultipartFile> files, String idCenad, String id) throws Exception {
		Path docRecursosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docRecursosFolder.toString(), id);
		Files.createDirectories(docRecursosFolder2);
		String[] nombresArchivos = new String[files.size()];
		for (int i = 0; i < files.size(); i++) {
			this.saveDocRecurso(files.get(i), idCenad, id);
			nombresArchivos[i] = files.get(i).getOriginalFilename();
		}
		return Arrays.toString(nombresArchivos);
	}

	/**
	 * Metodo para cargar los archivos de un recurso
	 */
	@Override
	public Stream<Path> loadAllDocRecursos(String idCenad, String id) throws Exception {
		Path docRecursosFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docRecursosFolder.toString(), id);
		return Files.walk(docRecursosFolder2, 1).filter(path -> !path.equals(docRecursosFolder2))
				.map(docRecursosFolder2::relativize);
	}

	// ************************************************************
	// Métodos para tratar los ficheros asociados a las solicitudes
	// ************************************************************

	/**
	 * Metodo para guardar el archivo de una solicitud
	 */
	@Override
	public String saveDocSolicitud(MultipartFile file, String idCenad, String id) throws Exception {
		Path docSolicitudesFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docSolicitudesFolder.toString(), id);
		Files.createDirectories(docSolicitudesFolder2);
		Path destino = docSolicitudesFolder2.resolve(file.getOriginalFilename());
		// Sobrescribe si el archivo ya existe
		Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
		return file.getOriginalFilename(); // devuelves el nombre que has decidido usar
	}

	/**
	 * Metodo para borrar el archivo de una solicitud
	 */
	@Override
	public String borrarDocSolicitud(String name, String idCenad, String id) throws Exception {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("El nombre del archivo no puede ser nulo o vacío");
		}
		Path docSolicitudesFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docSolicitudesFolder.toString(), id);
		Path file = docSolicitudesFolder2.resolve(name);
		String nombreArchivo = file.getFileName().toString();
		boolean borrado = Files.deleteIfExists(file);
		if (!borrado) {
			throw new FileNotFoundException("No se encontró el archivo: " + nombreArchivo);
		}
		return nombreArchivo;
	}

	/**
	 * Metodo para borrar la carpeta de una solicitud
	 */
	@Override
	public String borrarCarpetaDocSolicitud(String idCenad, String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta de Documentos de Solicitudes " + id;
		Path docSolicitudesFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docSolicitudesFolder.toString());
		Path carpeta = docSolicitudesFolder2.resolve(id);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}

	/**
	 * Metodo para cargar el archivo de una solicitud
	 */
	@Override
	public Resource loadDocSolicitud(String name, String idCenad, String id) throws Exception {
		Path docSolicitudesFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docSolicitudesFolder.toString(), id);
		Path file = docSolicitudesFolder2.resolve(name);
		Resource resource = new UrlResource(file.toUri());
		return resource;
	}

	/**
	 * Metodo para guardar varios archivos de una solicitud(en la actualidad no se
	 * usa por requerir informacion individual de cada fichero)
	 */
	@Override
	public String saveDocSolicitudes(List<MultipartFile> files, String idCenad, String id) throws Exception {
		Path docSolicitudesFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docSolicitudesFolder.toString(), id);
		Files.createDirectories(docSolicitudesFolder2);
		String[] nombresArchivos = new String[files.size()];
		for (int i = 0; i < files.size(); i++) {
			this.saveDocSolicitud(files.get(i),idCenad, id);
			nombresArchivos[i] = files.get(i).getOriginalFilename();
		}
		return Arrays.toString(nombresArchivos);
	}

	/**
	 * Metodo para cargar los archivos de una solicitud
	 */
	@Override
	public Stream<Path> loadAllDocSolicitudes(String idCenad, String id) throws Exception {
		Path docSolicitudesFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + idCenad,
				docSolicitudesFolder.toString(), id);
		return Files.walk(docSolicitudesFolder2, 1).filter(path -> !path.equals(docSolicitudesFolder2))
				.map(docSolicitudesFolder2::relativize);
	}

	// *************************************************************
	// Métodos para tratar los ficheros asociados a las cartografías
	// *************************************************************

	/**
	 * Metodo para guardar el archivo de un conjunto cartografico
	 */
	@Override
	public String saveCartografia(MultipartFile file, String id) throws Exception {
		Path cartografiasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				cartografiasFolder.toString());
		Files.createDirectories(cartografiasFolder2);
		Path destino = cartografiasFolder2.resolve(file.getOriginalFilename());
		// Sobrescribe si el archivo ya existe
		Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
		return file.getOriginalFilename(); // devuelves el nombre que has decidido usar
	}

	/**
	 * Metodo para borrar el archivo de un conjunto cartografico
	 */
	@Override
	public String borrarCartografia(String name, String id) throws Exception {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("El nombre del archivo no puede ser nulo o vacío");
		}
		Path cartografiasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				cartografiasFolder.toString());
		Path file = cartografiasFolder2.resolve(name);
		String nombreArchivo = file.getFileName().toString();
		boolean borrado = Files.deleteIfExists(file);
		if (!borrado) {
			throw new FileNotFoundException("No se encontró el archivo: " + nombreArchivo);
		}
		return nombreArchivo;
	}

	/**
	 * Metodo para borrar la carpeta de un conjunto cartografico
	 */
	@Override
	public String borrarCarpetaCartografia(String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta de Cartografías " + id;
		Path cartografiasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id);
		Path carpeta = cartografiasFolder2.resolve(cartografiasFolder);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}

	/**
	 * Metodo para cargar el archivo de un conjunto cartografico
	 */
	@Override
	public Resource loadCartografia(String name, String id) throws Exception {
		Path cartografiasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				cartografiasFolder.toString());
		Path file = cartografiasFolder2.resolve(name);
		Resource resource = new UrlResource(file.toUri());
		return resource;
	}

	/**
	 * Metodo para guardar varios archivos de un conjunto cartografico (en la
	 * actualidad no se usa por querer añadir informacion individual a cada fichero)
	 */
	@Override
	public String saveCartografias(List<MultipartFile> files, String id) throws Exception {
		Path cartografiasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				cartografiasFolder.toString());
		Files.createDirectories(cartografiasFolder2);
		String[] nombresArchivos = new String[files.size()];
		for (int i = 0; i < files.size(); i++) {
			this.saveCartografia(files.get(i), id);
			nombresArchivos[i] = files.get(i).getOriginalFilename();
		}
		return Arrays.toString(nombresArchivos);
	}

	/**
	 * Metodo para cargar varios archivos de un conjunto cartografico
	 */
	@Override
	public Stream<Path> loadAllCartografias(String id) throws Exception {
		Path cartografiasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				cartografiasFolder.toString());
		return Files.walk(cartografiasFolder2, 1).filter(path -> !path.equals(cartografiasFolder2))
				.map(cartografiasFolder2::relativize);
	}

	// *************************************************************
	// Métodos para tratar los ficheros asociados a las normativas
	// *************************************************************

	/**
	 * Metodo para guardar el archivo de una normativa
	 */
	@Override
	public String saveNormativa(MultipartFile file, String id) throws Exception {
		Path normativasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				normativasFolder.toString());
		Files.createDirectories(normativasFolder2);
		Path destino = normativasFolder2.resolve(file.getOriginalFilename());
		// Sobrescribe si el archivo ya existe
		Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
		return file.getOriginalFilename(); // devuelves el nombre que has decidido usar
	}

	/**
	 * Metodo para borrar el archivo de una normativa
	 */
	@Override
	public String borrarNormativa(String name, String id) throws Exception {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("El nombre del archivo no puede ser nulo o vacío");
		}
		Path normativasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				normativasFolder.toString());
		Path file = normativasFolder2.resolve(name);
		String nombreArchivo = file.getFileName().toString();
		boolean borrado = Files.deleteIfExists(file);
		if (!borrado) {
			throw new FileNotFoundException("No se encontró el archivo: " + nombreArchivo);
		}
		return nombreArchivo;
	}

	/**
	 * Metodo para borrar la carpeta de una normativa
	 */
	@Override
	public String borrarCarpetaNormativa(String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta de Normativa " + id;
		Path normativasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id);
		Path carpeta = normativasFolder2.resolve(normativasFolder);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}

	/**
	 * Metodo para cargar el archivo de una normativa
	 */
	@Override
	public Resource loadNormativa(String name, String id) throws Exception {
		Path normativasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				normativasFolder.toString());
		Path file = normativasFolder2.resolve(name);
		Resource resource = new UrlResource(file.toUri());
		return resource;
	}

	/**
	 * Metodo para guardar varios archivos de una normativa (en la actualidad no se
	 * usa por querer añadir informacion individual a cada fichero)
	 */
	@Override
	public String saveNormativas(List<MultipartFile> files, String id) throws Exception {
		Path normativasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				normativasFolder.toString());
		Files.createDirectories(normativasFolder2);
		String[] nombresArchivos = new String[files.size()];
		for (int i = 0; i < files.size(); i++) {
			this.saveNormativa(files.get(i), id);
			nombresArchivos[i] = files.get(i).getOriginalFilename();
		}
		return Arrays.toString(nombresArchivos);
	}

	/**
	 * Metodo para cargar varios archivos de una normativa
	 */
	@Override
	public Stream<Path> loadAllNormativas(String id) throws Exception {
		Path normativasFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				normativasFolder.toString());
		return Files.walk(normativasFolder2, 1).filter(path -> !path.equals(normativasFolder2))
				.map(normativasFolder2::relativize);
	}

	// *************************************************************
	// Métodos para tratar los ficheros asociados a infoCenad
	// *************************************************************

	/**
	 * Metodo para guardar el archivo de infoCenad
	 */
	@Override
	public String saveInfoCenad(MultipartFile file, String id) throws Exception {
		Path infoCenadsFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				infoCenadsFolder.toString());
		Files.createDirectories(infoCenadsFolder2);
		Path destino = infoCenadsFolder2.resolve(file.getOriginalFilename());
		// Sobrescribe si el archivo ya existe
		Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
		return file.getOriginalFilename(); // devuelves el nombre que has decidido usar
	}

	/**
	 * Metodo para borrar el archivo de infoCenad
	 */
	@Override
	public String borrarInfoCenad(String name, String id) throws Exception {
		if (name == null || name.trim().isEmpty()) {
			throw new IllegalArgumentException("El nombre del archivo no puede ser nulo o vacío");
		}
		Path infoCenadsFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				infoCenadsFolder.toString());
		Path file = infoCenadsFolder2.resolve(name);
		String nombreArchivo = file.getFileName().toString();
		boolean borrado = Files.deleteIfExists(file);
		if (!borrado) {
			throw new FileNotFoundException("No se encontró el archivo: " + nombreArchivo);
		}
		return nombreArchivo;
	}

	/**
	 * Metodo para borrar la carpeta de infoCenad
	 */
	@Override
	public String borrarCarpetaInfoCenad(String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta de InfoCenad " + id;
		Path infoCenadsFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id);
		Path carpeta = infoCenadsFolder2.resolve(infoCenadsFolder);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}

	/**
	 * Metodo para cargar el archivo de infoCenad
	 */
	@Override
	public Resource loadInfoCenad(String name, String id) throws Exception {
		Path infoCenadsFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				infoCenadsFolder.toString());
		Path file = infoCenadsFolder2.resolve(name);
		Resource resource = new UrlResource(file.toUri());
		return resource;
	}

	/**
	 * Metodo para guardar varios archivos de infoCenad (en la actualidad no se usa
	 * por querer añadir informacion individual a cada fichero)
	 */
	@Override
	public String saveInfoCenads(List<MultipartFile> files, String id) throws Exception {
		Path infoCenadsFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				infoCenadsFolder.toString());
		Files.createDirectories(infoCenadsFolder2);
		String[] nombresArchivos = new String[files.size()];
		for (int i = 0; i < files.size(); i++) {
			this.saveInfoCenad(files.get(i), id);
			nombresArchivos[i] = files.get(i).getOriginalFilename();
		}
		return Arrays.toString(nombresArchivos);
	}

	/**
	 * Metodo para cargar varios archivos de infoCenad
	 */
	@Override
	public Stream<Path> loadAllInfoCenads(String id) throws Exception {
		Path infoCenadsFolder2 = Paths.get(comunFolder.toString(), cenadFolder.toString() + " " + id,
				infoCenadsFolder.toString());
		return Files.walk(infoCenadsFolder2, 1).filter(path -> !path.equals(infoCenadsFolder2))
				.map(infoCenadsFolder2::relativize);
	}

	/**
	 * Metodo para borrar la carpeta entera de un Cenad
	 */
	@Override
	public String borrarCarpetaCenad(String id) throws Exception {
		String carpetaBorrada = "Se ha borrado la carpeta entera del CENAD/CMT " + id;
		Path cenadFolder2 = Paths.get(cenadFolder.toString() + " " + id);
		Path carpeta = comunFolder.resolve(cenadFolder2);
		Files.walk(carpeta).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
		return carpetaBorrada;
	}
}