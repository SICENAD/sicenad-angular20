package es.mde.security.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import es.mde.security.auth.AuthResponseChangePassword;
import es.mde.security.auth.AuthResponseLogin;
import es.mde.security.auth.AuthResponseRegister;
import es.mde.security.auth.ChangePasswordRequest;
import es.mde.security.auth.LoginRequest;
import es.mde.security.auth.RegisterRequest;
import es.mde.security.usuarios.Rol;
import es.mde.security.usuarios.Usuario;
import es.mde.security.usuarios.UsuarioAdministrador;
import es.mde.security.usuarios.UsuarioAdministradorDAO;
import es.mde.security.usuarios.UsuarioDAO;
import es.mde.security.usuarios.UsuarioGestor;
import es.mde.security.usuarios.UsuarioGestorDAO;
import es.mde.security.usuarios.UsuarioNormal;
import es.mde.security.usuarios.UsuarioNormalDAO;
import es.mde.security.usuarios.UsuarioSuperadministrador;
import es.mde.security.usuarios.UsuarioSuperadministradorDAO;

@Service
public class AuthService {

	private final UsuarioDAO usuarioDAO;
	private final UsuarioSuperadministradorDAO usuarioSuperadministradorDAO;
	private final UsuarioAdministradorDAO usuarioAdministradorDAO;
	private final UsuarioGestorDAO usuarioGestorDAO;
	private final UsuarioNormalDAO usuarioNormalDAO;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;

	public AuthService(UsuarioDAO usuarioDAO, UsuarioSuperadministradorDAO usuarioSuperadministradorDAO,
			UsuarioAdministradorDAO usuarioAdministradorDAO, UsuarioGestorDAO usuarioGestorDAO,
			UsuarioNormalDAO usuarioNormalDAO, JwtService jwtService, PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager) {
		this.usuarioDAO = usuarioDAO;
		this.usuarioSuperadministradorDAO = usuarioSuperadministradorDAO;
		this.usuarioAdministradorDAO = usuarioAdministradorDAO;
		this.usuarioGestorDAO = usuarioGestorDAO;
		this.usuarioNormalDAO = usuarioNormalDAO;
		this.jwtService = jwtService;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
	}

	public AuthResponseLogin login(LoginRequest request) {
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
		Usuario user = usuarioDAO.findByUsername(request.getUsername()).orElseThrow();
		String token = jwtService.getToken(user);

		AuthResponseLogin authResponse = new AuthResponseLogin(token, request.getUsername(), user.getRol());

		return authResponse;
	}

	public AuthResponseRegister register(RegisterRequest request) {

		if (request.getRol() == Rol.Superadministrador) {
			UsuarioSuperadministrador usuario = new UsuarioSuperadministrador();
			formarUsuario(usuario, request);
			usuarioSuperadministradorDAO.save(usuario);
			AuthResponseRegister authResponse = new AuthResponseRegister("Se ha registrado a " + usuario.getUsername(),usuario.getRol().toString());
			return authResponse;
		} else if (request.getRol() == Rol.Administrador) {
			UsuarioAdministrador usuario = new UsuarioAdministrador();
			formarUsuario(usuario, request);
			usuarioAdministradorDAO.save(usuario);
			AuthResponseRegister authResponse = new AuthResponseRegister("Se ha registrado a " + usuario.getUsername(),usuario.getRol().toString());
			return authResponse;
		} else if (request.getRol() == Rol.Gestor) {
			UsuarioGestor usuario = new UsuarioGestor();
			formarUsuario(usuario, request);
			usuarioGestorDAO.save(usuario);
			AuthResponseRegister authResponse = new AuthResponseRegister("Se ha registrado a " + usuario.getUsername(),usuario.getRol().toString());
			return authResponse;
		} else if (request.getRol() == Rol.Normal) {
			UsuarioNormal usuario = new UsuarioNormal();
			formarUsuario(usuario, request);
			usuarioNormalDAO.save(usuario);
			AuthResponseRegister authResponse = new AuthResponseRegister("Se ha registrado a " + usuario.getUsername(),usuario.getRol().toString());
			return authResponse;
		}
		return null;
	}

	public AuthResponseChangePassword changePassword(ChangePasswordRequest request) {

		Usuario usuario = usuarioDAO.findByIdString(request.getIdUsuario());
		usuario.setPassword(passwordEncoder.encode(request.getPassword()));
		usuarioDAO.save(usuario);
		
		AuthResponseChangePassword authResponse = new AuthResponseChangePassword(usuario.getUsername(),usuario.getRol().toString());
		return authResponse;
	}

	public Usuario formarUsuario(Usuario usuario, RegisterRequest request) {
		usuario.setUsername(request.getUsername());
		usuario.setPassword(passwordEncoder.encode(request.getPassword()));
		usuario.setEmail(request.getEmail());
		usuario.setTfno(request.getTfno());
		usuario.setDescripcion(request.getDescripcion());
		usuario.setEmailAdmitido(request.isEmailAdmitido());
		usuario.setRol(request.getRol());
		return usuario;
	}

}
