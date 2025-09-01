# Aplicación `SICENAD` 

![MADOC](https://git.institutomilitar.com/sicenad/sicenad/-/wikis/7.-MANUAL_USUARIO/imagenes/madoc.png)

## DOCUMENTACIÓN

- Puede consultar la documentación accediendo a la [WIKI](https://git.institutomilitar.com/sicenad/sicenad/wikis/home).

- Como documentación más específica del BACK, se puede consultar su [Javadoc](https://sicenad.github.io/sicenad_backend_javadoc_documentation/), así como su [documentación Postman](https://documenter.getpostman.com/view/15313739/UVByHpXD).

- Para documentacion más especifica del FRONT, se puede consultar en la siguiente [URL](https://sicenad.github.io/sicenad_frontend_documentation/).

## DESARROLLO

- El **primer prototipo**, perteneciente al primer sprint, utiliza una BD ELEPHANTSQL, y despliega la API en [Heroku](https://www.heroku.com/), y la aplicación en [Netlify](https://www.netlify.com/). Se puede acceder al prototipo [aquí](https://sicenad.netlify.app/)

- El **segundo prototipo**, perteneciente al segundo sprint, utiliza una BD SQL Server (en el servidor privado situado en el simulador Casiopea del CENAD SG), y despliega la API y la aplicación web en IIS, en el mencionado servidor. Se puede acceder al prototipo desde [aquí](http://192.168.100.199/sicenad) (no accesible desde internet). 

- El **tercer prototipo**, perteneciente al tercer sprint, utiliza una BD SQL Server (en el servidor privado situado en el simulador Casiopea del CENAD SG), y despliega la API y la aplicación web en IIS, en el mencionado servidor. Se puede acceder al prototipo desde [aquí](http://192.168.100.199/sicenad) (no accesible desde internet). 

- En producción se desplegará en el servidor del CENAD SG, utilizando una BD SQL Server (accesible desde WAN-PG MINISDEF).

## FUNCIONALIDADES PRINCIPALES

- Se necesita una aplicación para poder gestionar los recursos de los CENAD,s/CMT,s del Ejército de Tierra.  
- La aplicación `SICENAD` permitirá crear y mantener una BD de sus CENAD,s/CMT,s, con sus respectivos recursos, pudiendo administrarse cada CENAD/CMT por sí mismo, pero manteniéndose un control centralizado.
- Cada CENAD/CMT podrá decidir su estructura de recursos y podrá personalizarlos, sin necesidad de ningún conocimiento de programación.
- Cada CENAD/CMT dispondrá además de un repositorio actualizado de cartografía.
- Cada CENAD/CMT mostrará la ocupación de sus recursos en un calendario, que además permitirá, según el rol del usuario, acceder a las solicitudes a las que referencian.
- Cada cambio de estado de una solicitud de un recurso generará automáticamente una notificación (email corporativo) a los usuarios afectados (si han manifestado querer recibir notificaciones).
- Se adjunta un manual de usuario, que estará disponible desde la aplicación, para facilitar el uso de la misma.

[DIM Sandstorm](https://dim.institutomilitar.com/) |  [DIM Web](https://web.institutomilitar.com/) | [Recursos Online DIM](https://web.institutomilitar.com/recursos-online.html)
# sicenad-desplegable-2024
