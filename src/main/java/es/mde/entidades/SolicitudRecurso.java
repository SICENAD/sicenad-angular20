package es.mde.entidades;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

import es.mde.repositorios.SolicitudRecursoListener;
import es.mde.security.usuarios.UsuarioNormal;

/**
 * Representa las solicitudes de recursos
 * 
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Entity
@Table(name = "SOLICITUDES")
@EntityListeners(SolicitudRecursoListener.class)
public class SolicitudRecurso {

	// **************************************
	// DATOS COMUNES A TODAS LAS SOLICITUDES
	// **************************************

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(unique = true)
	private Long id;
	private String idString;
//	@Lob
	private String observaciones;
//	@Lob
	private String observacionesCenad;
	private String jefeUnidadUsuaria;
	private String pocEjercicio;
	private String tlfnRedactor;
	private String estado; // Borrador, Solicitada, Rechazada, Validada, Cancelada
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaSolicitud;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaUltModSolicitud;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaHoraInicioRecurso;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaHoraFinRecurso;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaFinDocumentacion;
	private String unidadUsuaria;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "USUARIO_NORMAL")
	private UsuarioNormal usuarioNormal;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Fichero.class, mappedBy = "solicitudRecursoCenad")
	private Collection<Fichero> documentacionCenad = new ArrayList<>();
	@OneToMany(cascade = CascadeType.ALL, targetEntity = Fichero.class, mappedBy = "solicitudRecursoUnidad")
	private Collection<Fichero> documentacionUnidad = new ArrayList<>();
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RECURSO")
	private Recurso recurso;
	private String etiqueta;

	// *************************************
	// DATOS ESPECIFICOS DE LOS RECURSOS
	// *************************************

	// ZONA DE CAIDA DE PROYECTILES/EXPLOSIVOS

	private Boolean conMunTrazadoraIluminanteFumigena;
	@OneToMany(cascade = CascadeType.ALL, targetEntity = SolicitudArma.class, mappedBy = "solicitud")
	private Collection<SolicitudArma> solicitudesArmas = new ArrayList<>();

	// CAMPO DE TIRO DE CARROS, VCI/C, PRECISICION

	private String tipoEjercicio;
	private String armaPral;
	private int armaPrpalNumDisparosPrev;
	private String armaSecund;
	private int armaSecundNumDisparosPrev;

	// CAMPO DE TIRO LASER (se han creado hasta 5 tipos de blancos para hacerlo
	// compatible con cualquier CENAD/CMT)

	private int numBlancosFijosA;
	private int numBlancosFijosB;
	private int numBlancosFijosC;
	private int numBlancosFijosD;
	private int numBlancosFijosE;
	private int numBlancosMovilesA;
	private int numBlancosMovilesB;
	private int numBlancosMovilesC;
	private int numBlancosMovilesD;
	private int numBlancosMovilesE;

	// CAMPO DE TIRO

	private String arma1CT;
	private int arma1CTlongitud;
	private String arma2CT;
	private int arma2CTlongitud;

	// CAMPO EXPLOSIVOS

	private String explosivo;

	// POLIGONO DE COMBATE EN ZONAS URBANAS
	// no tiene atributos específicos

	// COMBATE URBANO
	// no tiene atributos específicos

	// TORRE MULTIUSOS
	// no tiene atributos específicos

	// CASA 3 ALTURAS
	// no tiene atributos específicos

	// PISTA DE CONDUCCION TT/OBSTACULOS
	// no tiene atributos específicos

	// EJERCICIOS ZONA RESTRINGIDA

	private String actividad;

	// LOGISTICA
	// ACANTONAMIENTO/VIVAC

	private String vivac;

	// ZONA DE VIDA DE BATALLON

	private Boolean conUsoCocina;
	private int numPersonasZVB;

	// ZONA DE ESPERA

	private int numPersonasZE;

	// LAVADEROS

	private int numVehCadenas;
	private int numVehRuedas;

	// SIMULACION REAL LASER

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaHoraMontaje;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
	private Date fechaHoraDesmontaje;
	private int numSimuladores;
	private String usoEstacionSeg;

	// OTROS RECURSOS
	// no contiene atributos específicos
	private String otrosDatosEspecificos;

	/**
	 * Crea una solicitud
	 */
	public SolicitudRecurso() {
		super();
	}

	// *******************************************************
	// getters y setters DATOS COMUNES A TODAS LAS SOLICITUDES
	// *******************************************************

	/**
	 * Devuelve el Id de la solicitud
	 * 
	 * @return Devuelve el Id de la solicitud
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Guarda el Id de la solicitud
	 * 
	 * @param id Id de la solicitud
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	/**
	 * Devuelve el id de la solicitud
	 * @return Devuelve el id de la solicitud
	 */
	public String getIdString() {
		return idString;
	}
	
	/**
	 * Guarda el id de la solicitud
	 * @param idString Guarda el id de la solicitud
	 */
	public void setIdString(String idString) {
		this.idString = idString;
	}

	/**
	 * Devuelve las observaciones de una solicitud
	 * 
	 * @return Devuelve las observaciones de una solicitud
	 */
	public String getObservaciones() {
		return observaciones;
	}

	/**
	 * Guarda las observaciones de una solicitud
	 * 
	 * @param observaciones Observaciones de la solicitud
	 */
	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
	}

	/**
	 * Devuelve el estado de la solicitud
	 * 
	 * @return Devuelve el estado de la solicitud
	 */
	public String getEstado() {
		return estado;
	}

	/**
	 * Guarda el estado de una solicitud
	 * 
	 * @param estado Estado de la solicitud
	 */
	public void setEstado(String estado) {
		this.estado = estado;
	}

	/**
	 * Devuelve el recurso que se solicita
	 * 
	 * @return Devuelve el recurso que se solicita
	 */
	public Recurso getRecurso() {
		return recurso;
	}

	/**
	 * Guarda el recurso de la solicitud
	 * 
	 * @param recurso Recurso solicitado
	 */
	public void setRecurso(Recurso recurso) {
		this.recurso = recurso;
	}

	/**
	 * Devuelve la fecha en la que se produce la solicitud
	 * 
	 * @return Devuelve la fecha en la que se produce la solicitud
	 */
	public Date getFechaSolicitud() {
		return fechaSolicitud;
	}

	/**
	 * Guarda la fecha en la que se produce la solicitud
	 * 
	 * @param fechaSolicitud Fecha en la que se produce la solicitud
	 */
	public void setFechaSolicitud(Date fechaSolicitud) {
		this.fechaSolicitud = fechaSolicitud;
	}

	/**
	 * Devuelve la fecha en la que se ha modificado la solicitud por ultima vez
	 * 
	 * @return Devuelve la fecha en la que se ha modificado la solicitud por ultima
	 *         vez
	 */
	public Date getFechaUltModSolicitud() {
		return fechaUltModSolicitud;
	}

	/**
	 * Guarda la fecha en la que se ha modificado la solicitud por ultima vez
	 * 
	 * @param fechaUltModSolicitud Fecha en la que se ha modificado la solicitud por
	 *                             ultima vez
	 */
	public void setFechaUltModSolicitud(Date fechaUltModSolicitud) {
		this.fechaUltModSolicitud = fechaUltModSolicitud;
	}

	/**
	 * Devuelve el usuario que realiza la solicitud
	 * 
	 * @return Devuelve el usuario que realiza la solicitud
	 */
	public UsuarioNormal getUsuarioNormal() {
		return usuarioNormal;
	}

	/**
	 * Guarda el usuario que realiza la solicitud
	 * 
	 * @param usuarioNormal Usuario que realiza la solicitud
	 */
	public void setUsuarioNormal(UsuarioNormal usuarioNormal) {
		this.usuarioNormal = usuarioNormal;
	}

	/**
	 * Devuelve los ficheros que adjunta el gestor del recurso
	 * 
	 * @return Devuelve los ficheros que adjunta el gestor del recurso
	 */
	public Collection<Fichero> getDocumentacionCenad() {
		return documentacionCenad;
	}

	/**
	 * Guarda los ficheros que adjunta el gestor del recurso
	 * 
	 * @param documentacionCenad Ficheros que adjunta el gestor del recurso
	 */
	public void setDocumentacionCenad(Collection<Fichero> documentacionCenad) {
		this.documentacionCenad = documentacionCenad;
	}

	/**
	 * Devuelve los ficheros que adjunta el usuario que solicita el recurso
	 * 
	 * @return Devuelve los ficheros que adjunta el usuario que solicita el recurso
	 */
	public Collection<Fichero> getDocumentacionUnidad() {
		return documentacionUnidad;
	}

	/**
	 * Guarda los ficheros que adjunta el usuario que solicita el recurso
	 * 
	 * @param documentacionUnidad Ficheros que adjunta el usuario que solicita el
	 *                            recurso
	 */
	public void setDocumentacionUnidad(Collection<Fichero> documentacionUnidad) {
		this.documentacionUnidad = documentacionUnidad;
	}

	/**
	 * Devuelve las observaciones que hace el CENAD a la solicitud
	 * 
	 * @return Devuelve las observaciones que hace el CENAD a la solicitud
	 */
	public String getObservacionesCenad() {
		return observacionesCenad;
	}

	/**
	 * Guarda las observaciones que hace el CENAD a la solicitud
	 * 
	 * @param observacionesCenad Observaciones que hace el CENAD a la solicitud
	 */
	public void setObservacionesCenad(String observacionesCenad) {
		this.observacionesCenad = observacionesCenad;
	}

	/**
	 * Devuelve el Jefe de la unidad que solicita el recurso
	 * 
	 * @return Devuelve el Jefe de la unidad que solicita el recurso
	 */
	public String getJefeUnidadUsuaria() {
		return jefeUnidadUsuaria;
	}

	/**
	 * Guarda el Jefe de la unidad que solicita el recurso
	 * 
	 * @param jefeUnidadUsuaria Jefe de la unidad que solicita el recurso
	 */
	public void setJefeUnidadUsuaria(String jefeUnidadUsuaria) {
		this.jefeUnidadUsuaria = jefeUnidadUsuaria;
	}

	/**
	 * Devuelve el POC del ejercicio asociado a la solicitud
	 * 
	 * @return Devuelve el POC del ejercicio asociado a la solicitud
	 */
	public String getPocEjercicio() {
		return pocEjercicio;
	}

	/**
	 * Guarda el POC del ejercicio asociado a la solicitud
	 * 
	 * @param pocEjercicio POC del ejercicio asociado a la solicitud
	 */
	public void setPocEjercicio(String pocEjercicio) {
		this.pocEjercicio = pocEjercicio;
	}

	/**
	 * Devuelve el telefono del redactor de la solicitud
	 * 
	 * @return Devuelve el telefono del redactor de la solicitud
	 */
	public String getTlfnRedactor() {
		return tlfnRedactor;
	}

	/**
	 * Guarda el telefono del redactor de la solicitud
	 * 
	 * @param tlfnRedactor Telefono del redactor de la solicitud
	 */
	public void setTlfnRedactor(String tlfnRedactor) {
		this.tlfnRedactor = tlfnRedactor;
	}

	/**
	 * Devuelve la fecha y hora del inicio de la actividad
	 * 
	 * @return Devuelve la fecha y hora del inicio de la actividad
	 */
	public Date getFechaHoraInicioRecurso() {
		return fechaHoraInicioRecurso;
	}

	/**
	 * Guarda la fecha y hora del inicio de la actividad
	 * 
	 * @param fechaHoraInicioRecurso Fecha y hora del inicio de la actividad
	 */
	public void setFechaHoraInicioRecurso(Date fechaHoraInicioRecurso) {
		this.fechaHoraInicioRecurso = fechaHoraInicioRecurso;
	}

	/**
	 * Devuelve la fecha y hora del fin de la actividad
	 * 
	 * @return Devuelve la fecha y hora del fin de la actividad
	 */
	public Date getFechaHoraFinRecurso() {
		return fechaHoraFinRecurso;
	}

	/**
	 * Guarda la fecha y hora del fin de la actividad
	 * 
	 * @param fechaHoraFinRecurso Fecha y hora del fin de la actividad
	 */
	public void setFechaHoraFinRecurso(Date fechaHoraFinRecurso) {
		this.fechaHoraFinRecurso = fechaHoraFinRecurso;
	}

	/**
	 * Devuelve la fecha maxima para adjuntar documentacion
	 * 
	 * @return Devuelve la fecha maxima para adjuntar documentacion
	 */
	public Date getFechaFinDocumentacion() {
		return fechaFinDocumentacion;
	}

	/**
	 * Guarda la fecha maxima para adjuntar documentacion
	 * 
	 * @param fechaFinDocumentacion Fecha maxima para adjuntar documentacion
	 */
	public void setFechaFinDocumentacion(Date fechaFinDocumentacion) {
		this.fechaFinDocumentacion = fechaFinDocumentacion;
	}

	/**
	 * Devuelve la unidad a la que pertenece el usuario que solicita el recurso
	 * 
	 * @return Devuelve la unidad a la que pertenece el usuario que solicita el
	 *         recurso
	 */
	public String getUnidadUsuaria() {
		return unidadUsuaria;
	}

	/**
	 * Guarda la unidad a la que pertenece el usuario que solicita el recurso
	 * 
	 * @param unidadUsuaria Unidad a la que pertenece el usuario que solicita el
	 *                      recurso
	 */
	public void setUnidadUsuaria(String unidadUsuaria) {
		this.unidadUsuaria = unidadUsuaria;
	}

	/**
	 * Devuelve la etiqueta de la solicitud
	 * 
	 * @return Devuelve la etiqueta de la solicitud
	 */
	public String getEtiqueta() {
		return etiqueta;
	}

	/**
	 * Guarda la etiqueta de la solicitud
	 * 
	 * @param etiqueta Etiqueta de la solicitud
	 */
	public void setEtiqueta(String etiqueta) {
		this.etiqueta = etiqueta;
	}
	
	/**
	 * Devuelve las solicitudesArmas de una solicitud
	 * 
	 * @return las solicitudesArmas
	 */

	public Collection<SolicitudArma> getSolicitudesArmas() {
		return solicitudesArmas;
	}
	
	/**
	 * Guarda las solicitudesArmas de una solicitud
	 * 
	 * @param solicitudesArmas de una solicitud
	 */

	public void setSolicitudesArmas(Collection<SolicitudArma> solicitudesArmas) {
		this.solicitudesArmas = solicitudesArmas;
	}

	// Establece la relacion en los dos sentidos
	/**
	 * Agrega un fichero a la solicitud
	 * 
	 * @param fichero Fichero agregado a la solicitud
	 */
	public void addDocumentacionCenad(Fichero fichero) {
		getDocumentacionCenad().add(fichero);
		fichero.setSolicitudRecursoCenad(this);
	}

	// Establece la relación en los dos sentidos
	/**
	 * Agrega un fichero a la solicitud
	 * 
	 * @param fichero Fichero agregado a la solicitud
	 */
	public void addDocumentacionUnidad(Fichero fichero) {
		getDocumentacionUnidad().add(fichero);
		fichero.setSolicitudRecursoUnidad(this);
	}
	
	//Establece la relación en los dos sentidos
	/**
	 * Agrega una solicitudArma a la solicitud
	 * 
	 * @param solicitudArma
	 */

	public void addSolicitudArma(SolicitudArma solicitudArma) {
		getSolicitudesArmas().add(solicitudArma);
		solicitudArma.setSolicitud(this);
	}

	// ***************************************************
	// getters y setters DATOS ESPECIFICOS DE LOS RECURSOS
	// ***************************************************

	/**
	 * Devuelve el tipo de Ejercicio
	 * 
	 * @return tipoEjericio
	 */
	public String getTipoEjercicio() {
		return tipoEjercicio;
	}

	/**
	 * Guarda el tipo de Ejercicio
	 * 
	 * @param tipoEjercicio
	 */
	public void setTipoEjercicio(String tipoEjercicio) {
		this.tipoEjercicio = tipoEjercicio;
	}

	/**
	 * Devuelve el arma principal
	 * 
	 * @return el arma principal
	 */
	public String getArmaPral() {
		return armaPral;
	}

	/**
	 * Guarda el arma principal
	 * 
	 * @param armaPral
	 */
	public void setArmaPral(String armaPral) {
		this.armaPral = armaPral;
	}

	/**
	 * Devuelve el numero de disparos previstos del arma principal
	 * 
	 * @return numero de disparos previstos del arma principal
	 */
	public int getArmaPrpalNumDisparosPrev() {
		return armaPrpalNumDisparosPrev;
	}

	/**
	 * Guarda el numero de disparos previstos del arma principal
	 * 
	 * @param armaPrpalNumDisparosPrev
	 */
	public void setArmaPrpalNumDisparosPrev(int armaPrpalNumDisparosPrev) {
		this.armaPrpalNumDisparosPrev = armaPrpalNumDisparosPrev;
	}

	/**
	 * Devuelve el arma sencuandaria
	 * 
	 * @return el arma secundaria
	 */
	public String getArmaSecund() {
		return armaSecund;
	}

	/**
	 * Guarda el arma secuandaria
	 * 
	 * @param armaSecund
	 */
	public void setArmaSecund(String armaSecund) {
		this.armaSecund = armaSecund;
	}

	/**
	 * Devuelve el numero de disparos previsto del arma secundaria
	 * 
	 * @return numero de disparos previstos del arma secuandaria
	 */	
	public int getArmaSecundNumDisparosPrev() {
		return armaSecundNumDisparosPrev;
	}

	/**
	 * Guarda el numero de disparos previstos del arma secundaria
	 * 
	 * @param armaSecundNumDisparosPrev
	 */	
	public void setArmaSecundNumDisparosPrev(int armaSecundNumDisparosPrev) {
		this.armaSecundNumDisparosPrev = armaSecundNumDisparosPrev;
	}

	/**
	 * Devuelve el numero de blancos fijos A
	 * 
	 * @return umero de blancos fijos A
	 */
	public int getNumBlancosFijosA() {
		return numBlancosFijosA;
	}

	/**
	 * Guarda el numero de blancos fijos A
	 * 
	 * @param numBlancosFijosA
	 */
	public void setNumBlancosFijosA(int numBlancosFijosA) {
		this.numBlancosFijosA = numBlancosFijosA;
	}

	/**
	 * Devuelve el numero de blancos fijos B
	 * 
	 * @return numero de blancos fijos B
	 */
	public int getNumBlancosFijosB() {
		return numBlancosFijosB;
	}

	/**
	 * Guarda numero de blancos fijos B
	 * 
	 * @param numBlancosFijosB
	 */
	public void setNumBlancosFijosB(int numBlancosFijosB) {
		this.numBlancosFijosB = numBlancosFijosB;
	}

	/**
	 * Devuelve numero de blancos fijos C
	 * 
	 * @return numero de blancos fijos C
	 */
	public int getNumBlancosFijosC() {
		return numBlancosFijosC;
	}

	/**
	 * Guarda el numero de blancos fijos C
	 * 
	 * @param numBlancosFijosC
	 */
	public void setNumBlancosFijosC(int numBlancosFijosC) {
		this.numBlancosFijosC = numBlancosFijosC;
	}

	/**
	 * Devuelve el numero de blancos fijos D
	 * 
	 * @return numero de blancos fijos D
	 */
	public int getNumBlancosFijosD() {
		return numBlancosFijosD;
	}

	/**
	 * Guarda el numero de blancos fijos D
	 * 
	 * @param numBlancosFijosD
	 */
	public void setNumBlancosFijosD(int numBlancosFijosD) {
		this.numBlancosFijosD = numBlancosFijosD;
	}

	/**
	 * Devuelve el numero de blancos fijos E
	 * 
	 * @return el numero de blancos fijos E
	 */
	public int getNumBlancosFijosE() {
		return numBlancosFijosE;
	}

	/**
	 * Guarda el numero de blancos fijos E
	 * 
	 * @param numBlancosFijosE
	 */
	public void setNumBlancosFijosE(int numBlancosFijosE) {
		this.numBlancosFijosE = numBlancosFijosE;
	}

	/**
	 * Devuelve el numero de blancos moviles A
	 * 
	 * @return el numero de blancos moviles A
	 */
	public int getNumBlancosMovilesA() {
		return numBlancosMovilesA;
	}

	/**
	 * Guarda el numero de blancos moviles A
	 * 
	 * @param numBlancosMovilesA
	 */
	public void setNumBlancosMovilesA(int numBlancosMovilesA) {
		this.numBlancosMovilesA = numBlancosMovilesA;
	}

	/**
	 * Devuelve el numero de blancos moviles B
	 * 
	 * @return el numero de blancos moviles B
	 */
	public int getNumBlancosMovilesB() {
		return numBlancosMovilesB;
	}

	/**
	 * Guarda el numero de blancos moviles B
	 * 
	 * @param numBlancosMovilesB
	 */
	public void setNumBlancosMovilesB(int numBlancosMovilesB) {
		this.numBlancosMovilesB = numBlancosMovilesB;
	}

	/**
	 * Devuelve el numero de blancos moviles C
	 * 
	 * @return el numero de blancos moviles C
	 */
	public int getNumBlancosMovilesC() {
		return numBlancosMovilesC;
	}

	/**
	 * Guarda el numero de blancos moviles C
	 * 
	 * @param numBlancosMovilesC
	 */
	public void setNumBlancosMovilesC(int numBlancosMovilesC) {
		this.numBlancosMovilesC = numBlancosMovilesC;
	}

	/**
	 * Devuelve el numero de blancos moviles D
	 * 
	 * @return el numero de blancos moviles D
	 */
	public int getNumBlancosMovilesD() {
		return numBlancosMovilesD;
	}

	/**
	 * Guarda el numero de blancos moviles D
	 * 
	 * @param numBlancosMovilesD
	 */
	public void setNumBlancosMovilesD(int numBlancosMovilesD) {
		this.numBlancosMovilesD = numBlancosMovilesD;
	}

	/**
	 * Devuelve el numero de blancos moviles E
	 * 
	 * @return el numero de blancos moviles E
	 */
	public int getNumBlancosMovilesE() {
		return numBlancosMovilesE;
	}

	/**
	 * Guarda el numero de blancos moviles E
	 * 
	 * @param numBlancosMovilesE
	 */
	public void setNumBlancosMovilesE(int numBlancosMovilesE) {
		this.numBlancosMovilesE = numBlancosMovilesE;
	}

	/**
	 * Devuelve el arma1 del Campo de Tiro
	 * 
	 * @return el arma1 del Campo de Tiro
	 */
	public String getArma1CT() {
		return arma1CT;
	}

	/**
	 * Guarda el arma1 del Campo de Tiro
	 * 
	 * @param arma1ct
	 */
	public void setArma1CT(String arma1ct) {
		arma1CT = arma1ct;
	}

	/**
	 * Devuelve la longitud del arma1 del Campo de Tiro
	 * 
	 * @return la longitud del arma1 del Campo de Tiro
	 */
	public int getArma1CTlongitud() {
		return arma1CTlongitud;
	}

	/**
	 * Guarda la longitud del arma1 del Campo de Tiro
	 * 
	 * @param arma1cTlongitud
	 */
	public void setArma1CTlongitud(int arma1cTlongitud) {
		arma1CTlongitud = arma1cTlongitud;
	}

	/**
	 * Devuelve el arma2 del Campo de Tiro
	 * 
	 * @return el arma2 del Campo de Tiro
	 */
	public String getArma2CT() {
		return arma2CT;
	}

	/**
	 * Guarda el arma2 del Campo de Tiro
	 * 
	 * @param arma2ct
	 */
	public void setArma2CT(String arma2ct) {
		arma2CT = arma2ct;
	}

	/**
	 * Devuelve la longitud del arma2 del Campo de Tiro
	 * 
	 * @return la longitud del arma2 del Campo de Tiro
	 */
	public int getArma2CTlongitud() {
		return arma2CTlongitud;
	}

	/**
	 * Guarda la longitud del arma2 del Campo de Tiro
	 * 
	 * @param arma2cTlongitud
	 */
	public void setArma2CTlongitud(int arma2cTlongitud) {
		arma2CTlongitud = arma2cTlongitud;
	}

	/**
	 * Devuelve el explosivo utilizado en el Campo de Tiro
	 * 
	 * @return el explosivo utilizado en el Campo de Tiro
	 */
	public String getExplosivo() {
		return explosivo;
	}

	/**
	 * Guarda el explosivo utilizado en el Campo de Tiro
	 * 
	 * @param explosivo
	 */
	public void setExplosivo(String explosivo) {
		this.explosivo = explosivo;
	}

	/**
	 * Devuelve la actividad a realizar en la zona restringida
	 * 
	 * @return la actividad a realizar en la zona restringida
	 */
	public String getActividad() {
		return actividad;
	}

	/**
	 * Guarda la actividad a realizar en la zona restringida
	 * 
	 * @param actividad
	 */
	public void setActividad(String actividad) {
		this.actividad = actividad;
	}

	/**
	 * Devuelve las observaciones al vivac
	 * 
	 * @return las observaciones al vivac
	 */
	public String getVivac() {
		return vivac;
	}

	/**
	 * Guarda las observaciones al vivac
	 * 
	 * @param vivac
	 */
	public void setVivac(String vivac) {
		this.vivac = vivac;
	}

	/**
	 * Devuelve el numero de vehiculos de cadenas en el Lavadero
	 * 
	 * @return el numero de vehiculos de cadenas en el Lavadero
	 */
	public int getNumVehCadenas() {
		return numVehCadenas;
	}

	/**
	 * Guarda el numero de vehiculos de cadenas en el Lavadero
	 * 
	 * @param numVehCadenas
	 */
	public void setNumVehCadenas(int numVehCadenas) {
		this.numVehCadenas = numVehCadenas;
	}

	/**
	 * Devuelve el numero de vehiculos de ruedas en el Lavadero
	 * 
	 * @return el numero de vehiculos de ruedas en el Lavadero
	 */
	public int getNumVehRuedas() {
		return numVehRuedas;
	}

	/**
	 * Guarda el numero de vehiculos de ruedas en el Lavadero
	 * 
	 * @param numVehRuedas
	 */
	public void setNumVehRuedas(int numVehRuedas) {
		this.numVehRuedas = numVehRuedas;
	}

	/**
	 * Devuelve la fecha de montaje de los simuladores
	 * 
	 * @return la fecha de montaje de los simuladores
	 */
	public Date getFechaHoraMontaje() {
		return fechaHoraMontaje;
	}

	/**
	 * Guarda la fecha de montaje de los simuladores
	 * 
	 * @param fechaHoraMontaje
	 */
	public void setFechaHoraMontaje(Date fechaHoraMontaje) {
		this.fechaHoraMontaje = fechaHoraMontaje;
	}

	/**
	 * Devuelve la fecha de desmontaje de los simuladores
	 * 
	 * @return la fecha de desmontaje de los simuladores
	 */
	public Date getFechaHoraDesmontaje() {
		return fechaHoraDesmontaje;
	}

	/**
	 * Guarda la fecha de desmontaje de los simuladores
	 * 
	 * @param fechaHoraDesmontaje
	 */
	public void setFechaHoraDesmontaje(Date fechaHoraDesmontaje) {
		this.fechaHoraDesmontaje = fechaHoraDesmontaje;
	}

	/**
	 * Devuelve el numero de simuladores (simulacion real laser)
	 * 
	 * @return el numero de simuladores (simulacion real laser)
	 */
	public int getNumSimuladores() {
		return numSimuladores;
	}

	/**
	 * Guarda el numero de simuladores (simulacion real laser)
	 * 
	 * @param numSimuladores
	 */
	public void setNumSimuladores(int numSimuladores) {
		this.numSimuladores = numSimuladores;
	}

	/**
	 * Devuelve el uso que se le va a dar a la estacion seguimiento (simulacion real laser)
	 * 
	 * @return el uso que se le va a dar a la estacion seguimiento (simulacion real laser)
	 */
	public String getUsoEstacionSeg() {
		return usoEstacionSeg;
	}

	/**
	 * Guarda el uso que se le va a dar a la estacion seguimiento (simulacion real laser)
	 * 
	 * @param usoEstacionSeg
	 */
	public void setUsoEstacionSeg(String usoEstacionSeg) {
		this.usoEstacionSeg = usoEstacionSeg;
	}

	/**
	 * Devuelve si se va utilizar municion Trazadora/Iluminante/Fumigena en la Zona Caida Proyectiles
	 * 
	 * @return si se va utilizar municion Trazadora/Iluminante/Fumigena en la Zona Caida Proyectiles
	 */
	public Boolean isConMunTrazadoraIluminanteFumigena() {
		return conMunTrazadoraIluminanteFumigena;
	}

	/**
	 * Guarda si se va utilizar municion Trazadora/Iluminante/Fumigena en la Zona Caida Proyectiles
	 * 
	 * @param isConMunTrazadoraIluminanteFumigena
	 */
	public void setConMunTrazadoraIluminanteFumigena(Boolean conMunTrazadoraIluminanteFumigena) {
		this.conMunTrazadoraIluminanteFumigena = conMunTrazadoraIluminanteFumigena;
	}

	/**
	 * Devuelve si en la Zona Vida Bon se va a solicitar apoyo cocina
	 * 
	 * @return si en la Zona Vida Bon se va a solicitar apoyo cocina
	 */
	public Boolean isConUsoCocina() {
		return conUsoCocina;
	}

	/**
	 * Guarda si en la Zona Vida Bon se va a solicitar apoyo cocina
	 * 
	 * @param isConUsoCocina
	 */
	public void setconUsoCocina(Boolean conUsoCocina) {
		this.conUsoCocina = conUsoCocina;
	}

	/**
	 * Devuelve el numero de personas de la Zona Vida Bon
	 * 
	 * @return el numero de personas de la Zona Vida Bon
	 */
	public int getNumPersonasZVB() {
		return numPersonasZVB;
	}

	/**
	 * Guarda el numero de personas de la Zona Vida Bon
	 * 
	 * @param numPersonasZVB
	 */
	public void setNumPersonasZVB(int numPersonasZVB) {
		this.numPersonasZVB = numPersonasZVB;
	}

	/**
	 * Devuelve el numero de personas de la Zona de Espera
	 * 
	 * @return el numero de personas de la Zona de Espera
	 */
	public int getNumPersonasZE() {
		return numPersonasZE;
	}

	/**
	 * Guarda el numero de personas de la Zona de Espera
	 * 
	 * @param numPersonasZE
	 */
	public void setNumPersonasZE(int numPersonasZE) {
		this.numPersonasZE = numPersonasZE;
	}

	/**
	 * Devuelve otros datos especificos de la solicitud
	 * 
	 * @return Devuelve otros datos especificos de la solicitud
	 */

	public String getOtrosDatosEspecificos() {
		return otrosDatosEspecificos;
	}

	/**
	 * Guarda otros datos especificos de la solicitud
	 * 
	 * @param otrosDatosEspecificos Otros datos especificos de la solicitud
	 */
	public void setOtrosDatosEspecificos(String otrosDatosEspecificos) {
		this.otrosDatosEspecificos = otrosDatosEspecificos;
	}

}