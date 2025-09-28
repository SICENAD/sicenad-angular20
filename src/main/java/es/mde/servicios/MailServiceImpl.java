package es.mde.servicios;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@PropertySource("classpath:config/mail.properties")
public class MailServiceImpl implements MailService {

	@Autowired
	private JavaMailSender javaMailSender;

	@Override
	public String enviarNotificacion(String to, String subject, String body) throws MessagingException {

		MimeMessage message = javaMailSender.createMimeMessage();

		try {

			MimeMessageHelper helper = new MimeMessageHelper(message, true); // true indicates multipart message
			helper.setSubject(subject);
			helper.setTo(to);
			helper.setText(body + "<html><body><p><BR><p>Esta notificación ha sido generada por &nbsp; <strong>SICENAD</strong></p><BR><BR><b><i>\""
					+ "Los datos de carácter personal que puedan aparecer en este escrito o en sus documentos "
					+ "anexos, deberán ser tratados conforme a lo establecido en la legislación vigente en materia "
					+ "de Protección de Datos de DCP. (Ley Orgánica 3/2018, de 5 de diciembre, Protección de Datos"
					+ " Personales y Garantía de los Derechos Digitales.), debiendo ser empleados únicamente para "
					+ "la finalidad con que fueron comunicados y mantenidos durante no más tiempo del necesario para "
					+ "los fines del tratamiento\".</i></b></p></body></html>", true);
			javaMailSender.send(message);
		} catch (Exception e) {
			return "correo fallido" + e.getMessage();
		}
		return "Correo enviado a " + to;
	}
}
