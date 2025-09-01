package es.mde.repositorios;

import jakarta.persistence.PostPersist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import es.mde.entidades.Categoria;

@Component
public class CategoriaListener {

	private Logger log = LoggerFactory.getLogger(CategoriaListener.class);
	
	@PostPersist
	public void postGuardar(Categoria categoria) {
		categoria.setIdString(categoria.getId().toString());
		System.err.println("Se ha guardado la categoria: " + categoria.getNombre() + " con Id " + categoria.getIdString());
	}
	
}