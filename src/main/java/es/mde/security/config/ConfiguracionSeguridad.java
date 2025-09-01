package es.mde.security.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import es.mde.security.exceptionHandler_JwtAuthenticationFilter.JwtAuthenticationFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class ConfiguracionSeguridad {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final AuthenticationProvider authProvider;

	private static String allowedOriginLocal = "local";
	private static String allowedOriginProduccion = "produccion";

	
	public ConfiguracionSeguridad(JwtAuthenticationFilter jwtAuthenticationFilter,@Qualifier("allowedOriginLocal") String originLocal, @Qualifier("allowedOriginProduccion") String originProduccion,
			AuthenticationProvider authProvider) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.authProvider = authProvider;
		ConfiguracionSeguridad.allowedOriginLocal = originLocal;
		ConfiguracionSeguridad.allowedOriginProduccion = originProduccion;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http.cors(c -> c.configurationSource(corsConfigurationSource()))// importante porque anula la
																				// configuracion de CORS que pusimos en
																				// el Corsfilter de
																				// ConfiguracionRest.class
				.csrf(csrf -> csrf.disable()).authorizeHttpRequests(authRequest -> authRequest
//              	.requestMatchers(HttpMethod.GET).permitAll()
//              	.requestMatchers(HttpMethod.OPTIONS).permitAll()
//                .requestMatchers("/api/auth/**").permitAll()//permite registro y logging
						.requestMatchers("/api/auth/register", "/api/auth/login").permitAll()// permite solo register y logging
						//asi no permito en abierto cambiar los password
						.anyRequest().authenticated()
				// .permitAll()
				)
				.sessionManagement(
						sessionManager -> sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authenticationProvider(authProvider)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class).build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowCredentials(true);
		configuration.setAllowedOriginPatterns(Arrays.asList(allowedOriginLocal, allowedOriginProduccion));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "OPTIONS", "DELETE", "PATCH"));
		configuration.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}

		//configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://jose-server.turkey-banana.ts.net"));
