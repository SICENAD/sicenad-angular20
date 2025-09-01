package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.CategoriaFichero;

@Component
public class CategoriaFicheroListener {

	private Logger log = LoggerFactory.getLogger(CategoriaFicheroListener.class);
	
	@PostPersist
	public void postGuardar(CategoriaFichero categoriaFichero) {
		categoriaFichero.setIdString(categoriaFichero.getId().toString());
		System.err.println("Se ha guardado la categoriaFichero: " + categoriaFichero.getNombre() + " con Id " + categoriaFichero.getIdString());
	}
	
}