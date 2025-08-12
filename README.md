# Proyecto Unificado g4f

Este proyecto proporciona una versión unificada de tres mecanismos
originalmente separados: una interfaz de línea de comandos (CLI), un
intérprete de comandos y una interfaz web. Se eliminan las
dependencias y referencias a la herramienta **Gemini**, centrándose en
el uso de **g4f** como motor de IA. Internamente se emplea la librería
`g4f` de npm para realizar directamente las peticiones al modelo.
Además, se añaden límites de
entrada y comandos adicionales para un uso más profesional.

## Contenido

* `webui/` – Servidor HTTP y archivos estáticos que ofrecen una
  interfaz gráfica en el navegador. Permite cambiar entre vista de
  consola, chat y modo intérprete. Utiliza por defecto la API pública
  de **g4f** para generar respuestas. Ejecuta `node webui/server.js` y abre
  `http://localhost:3000` en el navegador.

* `g4f-cli` – Script de Node.js que unifica la interacción por
  consola. Ofrece tres modos (`cli`, `chat` e `interpreter`),
  comandos barra (`/help`, `/mode`, `/stats`, etc.), historial de
  comandos y ejecución de órdenes de shell con un directorio de
  trabajo persistente. Para iniciarlo, ejecute:

  ```sh
  ./g4f-cli
  ```

* `gemini-cli` – Alias que inicia la CLI unificada. Permite
  ejecutar el modo consola escribiendo simplemente `gemini-cli` (si
  el paquete se instaló globalmente).

* `gemini-web` – Alias que inicia el servidor web. Arranca el
  servidor de la carpeta `webui` al ejecutar `./gemini-web`.

* `g4f-menu` – Presenta un pequeño menú en la terminal para
  escoger entre iniciar la CLI, la interfaz web o las utilidades de
  `xdtest`.

* `gemini-cli/` – Carpeta residual del proyecto original de Gemini
  CLI. Ya no se utiliza y se conserva únicamente como referencia.

## Uso

> **Nota:** Para ejecutar los scripts definidos en `package.json` utilice
> siempre `npm run <script>`. Ejecutar `npm <script>` sin la palabra
> `run` provocará el mensaje de error `npm ERR! could not determine
> executable to run`.

### Web UI

1. Instale las dependencias (incluida `g4f`) con `npm install`.
2. Inicie el servidor ejecutando `./gemini-web` (o
   alternativamente `node webui/server.js`). Puede usar también
   `npm run web` para el mismo resultado.
3. Abra su navegador en `http://localhost:3000`. Podrá enviar
   mensajes al modelo, ejecutar comandos de intérprete y cambiar de
   modo. Los comandos de barra permiten mostrar ayuda,
   estadísticas y borrar el historial.

### CLI

Ejecute `./g4f-cli` en la raíz del proyecto. Si instaló el paquete de
forma global, también puede usar el alias `gemini-cli`. Por defecto
comenzará en modo `cli`. Escriba `/help` para ver los comandos
disponibles. El tamaño máximo de entrada está limitado para evitar
abusos (10.000 caracteres). Cambie de modo con `/mode chat` o
`/mode interpreter`.

Si instala el paquete de forma global (`npm install -g .`), npm creará enlaces ejecutables en la carpeta de binarios globales (consulte `npm bin -g`). Asegúrese de que esa ruta esté en su `PATH`; así podrá invocar `g4f-cli`, `gemini-web` o `g4f-menu` desde cualquier directorio.
Si al ejecutar `gemini-cli` en Windows aparece un mensaje "Cannot find module", instale el proyecto con `npm install -g .` y asegúrese de que la carpeta global de npm esté en la variable PATH. Como alternativa, ejecute la herramienta con `node %AppData%\npm\node_modules\g4f-unified-interface\bin\gemini-cli`.

Si no se especifica otro valor, el proveedor por defecto para las
peticiones de IA es **g4f**, que selecciona automáticamente un backend
disponible.

### Menú interactivo

Ejecute `./g4f-menu` para mostrar un menú que permite lanzar la
CLI, la interfaz web o la utilidad `cyrah`. Si instala el paquete de
forma global, podrá invocar simplemente `g4f-menu` desde cualquier
directorio.

## Eliminación de referencias a Gemini

Aunque el directorio `gemini-cli` permanece en el repositorio, el
código de la herramienta Gemini no se utiliza ni se hace referencia
en la interfaz web ni en la CLI. Toda la interacción se realiza a
través de **g4f**. Para limpiar por completo esta referencia, puede
eliminar la carpeta `gemini-cli` si lo desea.

## Límites y medidas de seguridad

* El servidor web y la CLI rechazan peticiones excesivamente largas
  para proteger contra abusos.
* El intérprete de comandos bloquea órdenes destructivas comunes como
  `rm`, `shutdown`, `reboot` o `sudo`.
* La variable `currentDir` garantiza que las órdenes de shell se
  ejecutan siempre en un directorio autorizado y que los cambios con
  `cd` persisten a lo largo de la sesión.

Adicionalmente, puede personalizar el comportamiento mediante
variables de entorno:

* `MODELS` – Lista separada por comas de modelos disponibles para la
  IA. Si se omite se usan los predeterminados.
* `START_DIR` – Directorio inicial para el modo intérprete.

## Mecánismos adicionales

Para mejorar la usabilidad, la CLI incorpora varios comandos de barra.  Además de los
comandos básicos de ayuda, limpieza y cambio de modo, se incluyen:

- **/models** – Lista los modelos disponibles.
- **/model &lt;nombre&gt;** – Cambia el modelo actual utilizado por la IA.
- **/auto** – Selecciona automáticamente el modelo predeterminado.
- **/time** – Muestra la fecha y la hora local.
- **/date** – Muestra solo la fecha local.
- **/reset** – Reinicia estadísticas e historial.
- **/echo &lt;texto&gt;** – Repite el texto proporcionado.
- **/count &lt;texto&gt;** – Devuelve la longitud del texto dado.
- **/version** – Muestra la versión actual de la herramienta.
- **/save &lt;archivo&gt;** – Guarda la conversación en un fichero JSON.
- **/load &lt;archivo&gt;** – Carga una conversación guardada.

La conversación se conserva entre peticiones dentro de una misma
sesión, por lo que el modelo dispone de contexto completo.

 La interfaz web incluye además un selector desplegable para elegir el
 modelo de IA en cada petición, con una opción *auto* que activa la
 selección automática. Si una solicitud al modelo falla se mostrará un
 mensaje de error en lugar de una respuesta simulada.

## Contribución

Las aportaciones son bienvenidas. Por favor, asegúrese de no
introducir dependencias de Gemini ni violar las restricciones
mencionadas arriba. Para ampliar las capacidades de IA, se puede
modificar la función `callG4F` en `g4f-cli` o el manejador
correspondiente en `webui/public/index.html`.

## Cyrah (xdtest)

Dentro del directorio `xdtest` se incluye un conjunto adicional de
utilidades basado en TypeScript que expone el comando `cyrah`. Al
instalar este paquete de forma global (`npm install -g .`) estarán
disponibles los binarios `cyrah` y `cyrah-auto` junto al resto de
herramientas. Puede ejecutarlos de la siguiente manera:

Antes de usar `cyrah` por primera vez asegúrese de compilar los
archivos TypeScript:

```sh
npm --workspace=xdtest run build
```
También puede ejecutar `npm run build` en la raíz del repositorio para
compilar automáticamente dicha carpeta junto con el resto del proyecto.

```sh
cyrah --help
cyrah-auto
```

Estas aplicaciones aprovechan la misma infraestructura que el resto del
proyecto para ofrecer un intérprete ampliado y opciones extra.
