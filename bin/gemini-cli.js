#!/usr/bin/env node
/*
 * Lanza la interfaz de línea de comandos unificada. Este archivo
 * existe para proporcionar un alias con el nombre solicitado
 * `gemini-cli`. Ejecuta el script `g4f-cli` ubicado en el
 * directorio superior.
 */

const path = require('path');
const cliPath = path.join(__dirname, '..', 'g4f-cli');
require(cliPath);
