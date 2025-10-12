package es.mde.sicenad;

import java.util.AbstractMap;
import java.util.Arrays;
import java.util.Properties;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

/**
 * ConfiguracionPorJava va a establecer los parametros configurables en los distintos properties, referenciándolos.
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@Configuration
@PropertySource({ "classpath:config/rest.properties", "classpath:config/jackson.properties", "classpath:config/archivos.properties",
"classpath:config/mail.properties", "classpath:config/gestionBBDD.properties"
	, "classpath:config/passwordsBD.properties" 
	})
@ComponentScan({"es.mde"})
@EnableTransactionManagement
@EnableJpaRepositories({"${misRepositorios}", "${entidadSecurity}"}) // leer valor de propiedades pero solo para las entidades anotadas
public class ConfiguracionPorJava {
	
	/**
	 * Para usar la ruta a escanear entidades desde el application.properties
	 */
	@Value("${misEntidades}")
	String entidades;

	/**
	 * Para usar la ruta a escanear entidades de seguridad desde el application.properties
	 */
	@Value("${entidadSecurity}")
	String entidadSecurity;

	/**
	 * Entity manager que sustituye al jpa-config.xml
	 */
	@Bean
	public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource, Environment env,
			JpaVendorAdapter vendorAdapter) {
		LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
		em.setDataSource(dataSource);
//	    JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter(); // O pedirlo como parametro y que haga el Autowired
		em.setJpaVendorAdapter(vendorAdapter);
		em.setPackagesToScan(entidades, entidadSecurity); // leer valor de propiedades? pero solo para las entidades anotadas		
		// em.setMappingResources("jpa/Usuario.orm.xml", "jpa/Cuaderno.orm.xml"); //para escanear archivos xml...
		// leerValorDePropiedades?
		Properties jpaProperties = new Properties();
		Arrays.asList("dialect", "show_sql", "hbm2ddl.auto", "enable_lazy_load_no_trans") //  leer valor de	para las entidades anotadas 
				.stream().map(s -> "hibernate." + s)
				.map(p -> new AbstractMap.SimpleEntry<String, String>(p, env.getProperty(p)))
				.filter(e -> e.getValue() != null).forEach(e -> jpaProperties.put(e.getKey(), e.getValue()));
		em.setJpaProperties(jpaProperties);
		return em;
	}

	@Bean
	public EntityManager entityManager(EntityManagerFactory emf) {
		System.err.println("--- LAS ENTIDADES MAPEADAS SON ---");
		emf.getMetamodel().getEntities().forEach(System.err::println);
		System.err.println("----------------------------------");

		return emf.createEntityManager();
	}
	
	@Value("${ruta.comun}")
	private String rutaComun;
	
	@Value("${ruta.cenad}")
	private String rutaCenad;
	
	@Value("${ruta.escudos}")
	private String rutaEscudos;

	@Value("${ruta.docRecursos}")
	private String rutaDocRecursos;

	@Value("${ruta.docSolicitudes}")
	private String rutaDocSolicitudes;
	
	@Value("${ruta.cartografias}")
	private String rutaCartografias;
	
	@Value("${ruta.normativas}")
	private String rutaNormativas;
	
	@Value("${ruta.infoCenads}")
	private String rutaInfoCenads;
	
	@Value("${size.escudos}")
	private long sizeLimiteEscudo;
	
	@Value("${size.docRecursos}")
	private long sizeLimiteDocRecurso;
	
	@Value("${size.docSolicitudes}")
	private long sizeLimiteDocSolicitud;
	
	/**
	 * Para usar los origins permitidos desde el application.properties
	 */
	@Value("${miAllowedOriginLocal}")
	private String allowedOriginLocal;

	@Value("${miAllowedOriginProduccion}")
	private String allowedOriginProduccion;
	
	/**
	 * Devuelve la ruta común donde se guardarán los archivos
	 * @return Devuelve la ruta común donde se guardarán los archivos
	 */
	@Bean("rutaComun")
	public String getRutaComun() {

		return rutaComun;
	}
	
	/**
	 * Devuelve la parte de la ruta por cenad
	 * @return Devuelve la parte de la ruta por cenad
	 */
	@Bean("rutaCenad")
	public String getRutaCenad() {
		return rutaCenad;
	}
	/**
	 * Devuelve la ruta donde se guardarán los escudos
	 * @return Devuelve la ruta donde se guardarán los escudos
	 */
	@Bean("rutaEscudos")
	public String getRutaEscudos() {

		return rutaEscudos;
	}

	/**
	 * Devuelve la ruta donde se guardarán los documentos de los recursos
	 * @return Devuelve la ruta donde se guardarán los documentos de los recursos
	 */
	@Bean("rutaDocRecursos")
	public String getRutaDocRecursos() {

		return rutaDocRecursos;
	}

	/**
	 * Devuelve la ruta donde se guardarán los documentos de las solicitudes
	 * @return Devuelve la ruta donde se guardarán los documentos de las solicitudes
	 */
	@Bean("rutaDocSolicitudes")
	public String getRutaDocSolicitudes() {

		return rutaDocSolicitudes;
	}
	
	/**
	 * Devuelve la ruta donde se guardarán los documentos de las cartografias
	 * @return Devuelve la ruta donde se guardarán los documentos de las cartografias
	 */
	@Bean("rutaCartografias")
	public String getRutaCartografias() {

		return rutaCartografias;
	}
	
	/**
	 * Devuelve la ruta donde se guardarán los documentos de las normativas
	 * @return Devuelve la ruta donde se guardarán los documentos de las normativas
	 */
	@Bean("rutaNormativas")
	public String getRutaNormativas() {

		return rutaNormativas;
	}
	
	/**
	 * Devuelve la ruta donde se guardará la imagen del mapa de ayuda a llegar al CENAD
	 * @return Devuelve la ruta donde se guardará la imagen del mapa de ayuda a llegar al CENAD
	 */
	@Bean("rutaInfoCenads")
	public String getRutaInfoCenads() {

		return rutaInfoCenads;
	}

	/**
	 * Devuelve el tamaño máximo permitido para un escudo
	 * @return Devuelve el tamaño máximo permitido para un escudo
	 */
	@Bean("sizeLimiteEscudo")
	public long getSizeLimiteEscudo() {

		return sizeLimiteEscudo;
	}
	
	/**
	 * Devuelve el tamaño máximo permitido para un documento de un recurso
	 * @return Devuelve el tamaño máximo permitido para un documento de un recurso
	 */
	@Bean("sizeLimiteDocRecurso")
	public long getSizeLimiteDocRecurso() {

		return sizeLimiteDocRecurso;
	}
	
	/**
	 * Devuelve el tamaño máximo permitido para un documento de una solicitud
	 * @return Devuelve el tamaño máximo permitido para un documento de una solicitud
	 */
	@Bean("sizeLimiteDocSolicitud")
	public long getSizeLimiteDocSolicitud() {

		return sizeLimiteDocSolicitud;
	}
		
	/**
	 * Devuelve los origins permitidos para el CORS
	 * @return Devuelve los origins permitidos para el CORS
	 */
	@Bean("allowedOriginLocal")
	public String getAllowedOriginLocal() {

		return allowedOriginLocal;
	}
	
	@Bean("allowedOriginProduccion")
	public String getAllowedOriginProduccion() {

		return allowedOriginProduccion;
	}
	
	/**
	 * Devuelve un ObjectMapper
	 * @return Devuelve un ObjectMapper
	 */
	@Bean
	public ObjectMapper getObjectMapper() {

		ObjectMapper mapper = new ObjectMapper();
		return mapper;
	}
	
	/**
	 * Configura el servicio de mail
	 */
	@Bean
	public JavaMailSender getJavaMailSender(@Value("${spring.mail.password}") String password,
			@Value("${spring.mail.username}") String direccion, @Value("${spring.mail.host}") String host,
			@Value("${spring.mail.port}") int port) {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setHost(host);
		mailSender.setPort(port);
		mailSender.setUsername(direccion);
		mailSender.setPassword(password);

		Properties props = mailSender.getJavaMailProperties();
	    props.put("mail.from", direccion); // remitente por defecto
		props.put("mail.transport.protocol", "smtp");
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.starttls.enable", "true");
		props.put("mail.debug", "true");

		return mailSender;
	}
	  }