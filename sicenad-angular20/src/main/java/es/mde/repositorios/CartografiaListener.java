package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Cartografia;

@Component
public class CartografiaListener {

	private Logger log = LoggerFactory.getLogger(CartografiaListener.class);
	
	@PostPersist
	public void postGuardar(Cartografia cartografia) {
		cartografia.setIdString(cartografia.getId().toString());
		System.err.println("Se ha guardado la cartografia: " + cartografia.getNombre() + " con Id " + cartografia.getIdString());
	}
	
}