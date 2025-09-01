Las variables `sizeMaxEscudo`, `sizeMaxDocRecurso` y `sizeMaxDocSolicitud` indican el número en "MB". En los dos últimos casos, el código está preparado para que si el docRecurso a subir es una imagen tenga en cuenta `sizeMaxEscudo`. Aquí se usa el nº de "MB", pero el código lo transformará a "bytes" y empleará "bytes".
De manera análoga `sizeMaxCartografia` indica el número en "GB" máximo.
La variable `tiempoMaximoLocalStorage` indica el número de **horas** pasadas las cuales, si no ha habido conexión, se borrará el Local Storage. 
La variable `tiposTiro` representa los tipos de tiro de la entidad `SOLICITUDARMA`.
La variable `hostSicenad` representa la url de la API a atacar.
La variable `categoriaFicheroCartografia` representa el id de la categoría de fichero que englobará la cartografía.