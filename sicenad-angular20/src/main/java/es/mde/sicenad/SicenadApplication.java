package es.mde.sicenad;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import es.mde.rest.ConfiguracionRest;

/**
 * Clase principal de la aplicación.
 * @author JOSE LUIS PUENTES ALAMOS - MIGUEL PRADA MUNOZ
 *
 */
@SpringBootApplication
//@ImportResource({ "classpath:config/jpa-config.xml" })
@Import({ ConfiguracionPorJava.class, ConfiguracionRest.class })
public class SicenadApplication {
	private static final Logger log = LoggerFactory.getLogger(SicenadApplication.class);
	
	/**
	 * Método que inicia la API
	 * @param args
	 */
	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(SicenadApplication.class, args);
		
		System.err.println("Está funcionando la aplicación SICENAD");
		log.debug("Está funcionando la aplicación SICENAD");

		}
}
