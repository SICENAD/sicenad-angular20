Las variables `sizeMaxEscudo`, `sizeMaxDocRecurso` y `sizeMaxDocSolicitud` indican el número en "MB". Aquí se usa el nº de "MB", pero el código lo transformará a "bytes" y empleará "bytes".
De manera análoga `sizeMaxCartografia` indica el número en "GB" máximo.
La variable `minutosExpiracionLocalStorage` indica el número de **minutos** pasados los cuales, si no ha habido conexión, se borrará el Local Storage. 
La variable `tiposTiro` representa los tipos de tiro de la entidad `SOLICITUDARMA`.
La variable `categoriaFicheroCartografia` representa el id de la categoría de fichero que englobará la cartografía.
La variable `urlApiHeroku` representa la url de Heroku donde se despliega el backend. No se usa, está de info para usarla en `urlApi`.
La variable `urlApi` representa la url donde se despliega el backend.
La variable `passwordForRegister` es el password que se utiliza para crear un `usuario superadministrador`, en el registro, ya que la url de registro no está securizada (en principio).
La variable `escalasCartografia` representa las distintas escalas de cartografía que permitirá seleccionar.
La variable `estadosSolicitud` representa los distintos estados en los que puede estar una solicitud.
La variable `coloresCalendario` representa los colores asignados en el calendario según el tipo de solicitud.
La variable `idiomasDisponibles` enumera los idiomas disponibles de la aplicación. Para añadir idiomas también hay que añadir el `idioma.json` y la imagen de la bandera.
La variable `coloresDisponibles` enumera los colores disponibles de la aplicación. Podemos poner la paleta y si cambiamos la paleta entera...
