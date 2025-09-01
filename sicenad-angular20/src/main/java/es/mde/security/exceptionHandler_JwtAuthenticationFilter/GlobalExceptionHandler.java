package es.mde.security.exceptionHandler_JwtAuthenticationFilter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ExcepcionResponse> handlerArgumentException(IllegalArgumentException ex)
    {
    	ExcepcionResponse respuesta = new ExcepcionResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<ExcepcionResponse>(respuesta, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ExcepcionResponse> handlerRuntimeException(RuntimeException ex)
    {
    	ExcepcionResponse respuesta = new ExcepcionResponse(ex.getMessage(), HttpStatus.BAD_GATEWAY);
        return new ResponseEntity<ExcepcionResponse>(respuesta, HttpStatus.BAD_GATEWAY);    }
}
