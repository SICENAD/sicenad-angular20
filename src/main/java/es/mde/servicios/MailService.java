package es.mde.servicios;

import jakarta.mail.MessagingException;

public interface MailService {

	 String enviarNotificacion(String to, String subject, String body) throws MessagingException;
}
