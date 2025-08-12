#!/usr/bin/env node
/*
 * Lanza la interfaz web del proyecto. Este alias se denomina
 * `gemini-web` y ejecuta el servidor HTTP definido en
 * webui/server.js. Si desea ajustar el puerto o configuración
 * adicional, edite el archivo webui/server.js directamente.
 */

const path = require('path');
const serverPath = path.join(__dirname, 'webui', 'server.js');
require(serverPath);
