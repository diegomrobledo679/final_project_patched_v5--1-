#!/usr/bin/env node
/*
 * Unified CLI for g4f
 *
 * This script provides a command‑line interface that unifies a chat
 * conversational mode, a CLI style prompt and an interpreter for
 * executing shell commands. The functionality mirrors the behaviour
 * offered by the web UI in this project. Responses are obtained
 * directly from the `g4f` package without any stubbed behaviour.
 *
 * Usage:
 *   node g4f‑cli.js
 *
 * Once running, type `/help` to see the available commands. The
 * current mode defaults to `cli`, where prompts are prefaced with
 * `>` and the AI responds. Switch modes with `/mode chat` or
 * `/mode interpreter`.
 */

const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { G4F } = require('g4f');
require('dotenv').config();
const pkg = require('./package.json');
const VERSION = pkg.version || 'dev';

// Create a single reusable client for all requests
const g4f = new G4F();

// Maximum length of a user input. Inputs longer than this will be
// rejected to prevent abuse and resource exhaustion. Adjust as
// required for your environment.
const MAX_INPUT_LENGTH = 10000;

// Available model names used when contacting g4f. Modify this
// array to reflect the models supported in your environment.
const MODELS = process.env.MODELS
  ? process.env.MODELS.split(',').map((m) => m.trim()).filter(Boolean)
  : ['gpt-4.1', 'gpt-3.5-turbo', 'gpt-4', 'claude-3-opus'];

// Current model selected by the user. Defaults to the first
// available model.
let currentModel = process.env.DEFAULT_MODEL && MODELS.includes(process.env.DEFAULT_MODEL) ? process.env.DEFAULT_MODEL : MODELS[0];

// Track the current mode: 'cli', 'chat' or 'interpreter'. Defaults
// to 'cli'.
let mode = 'cli';

// Persistent working directory for interpreter mode. This mirrors
// behaviour of the web UI and server. All shell commands execute
// relative to this directory. Initialise to the process working
// directory.
let currentDir = process.env.START_DIR
  ? path.resolve(process.env.START_DIR)
  : process.cwd();

// Counters for statistics.
let aiCount = 0;
let shellCount = 0;

// History of commands entered during this session.
const commandHistory = [];

// Conversation memory used when contacting the AI. Each element is
// a message object with a role and content so that context is
// preserved across requests.
let conversation = [];

/**
 * Request a completion from g4f using the currently selected model.
 *
 * @param {string} prompt The user prompt.
 * @returns {Promise<string>} The model response text, or an empty
 *   string if no response was returned.
 */
async function callG4F(prompt) {
  conversation.push({ role: 'user', content: prompt });
  const text = await g4f.chatCompletion(conversation, {
    model: currentModel,
    provider: g4f.providers.any,
  });
  if (text) {
    conversation.push({ role: 'assistant', content: text });
  }
  return text || '';
}

/**
 * Print a prompt reflecting the current mode. In CLI and chat
 * modes the prompt is `>`; in interpreter mode it is `$`. The
 * current working directory is also shown in interpreter mode.
 */
function printPrompt() {
  if (mode === 'interpreter') {
    // Display only the basename of the cwd for brevity
    const displayDir = path.basename(currentDir) || '/';
    process.stdout.write(`${displayDir} $ `);
  } else {
    process.stdout.write('> ');
  }
}

/**
 * Display help text for available slash commands. This mirrors
 * the help available in the web UI and adds notes specific to
 * this CLI.
 */
function showHelp() {
  console.log('Comandos disponibles:');
  console.log('  /help            Muestra esta ayuda.');
  console.log('  /clear           Limpia la pantalla de salida. (alias: /cls)');
  console.log('  /mode [tipo]     Cambia de modo (cli, chat o interpreter).');
  console.log('  /quit            Termina la sesión. (alias: /exit)');
  console.log('  /cwd             Muestra el directorio de trabajo actual. (alias: /pwd)');
  console.log('  /shell <cmd>     Ejecuta un comando de shell en modo interpreter desde cualquier modo.');
  console.log('  /stats           Muestra estadísticas de uso (solicitudes AI y comandos de shell).');
  console.log('  /history         Lista los comandos introducidos en esta sesión.');
  console.log('  /models          Lista los modelos de IA disponibles.');
  console.log('  /model <m>       Cambia el modelo de IA al especificado.');
  console.log('  /auto            Selecciona automáticamente el modelo por defecto.');
  console.log('  /time            Muestra fecha y hora actual.');
  console.log('  /date            Muestra solo la fecha actual.');
  console.log('  /echo <txt>      Repite el texto introducido.');
  console.log('  /count <txt>     Indica la longitud del texto.');
  console.log('  /version         Muestra la versión de la herramienta.');
  console.log('  /save <archivo>  Guarda la conversación en un archivo JSON.');
  console.log('  /load <archivo>  Carga una conversación previamente guardada.');
  console.log('');
}

/**
 * Handle a slash command. Returns true if the command was handled.
 *
 * @param {string} line The raw input beginning with '/' (without
 *   newline). Whitespace trimming is performed by the caller.
 * @returns {Promise<boolean>} True if a command was processed.
 */
async function handleSlashCommand(line) {
  const parts = line.slice(1).trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  switch (cmd) {
    case 'help':
      showHelp();
      return true;
    case 'clear':
    case 'cls':
      // Clear the terminal by printing the ANSI escape sequence
      process.stdout.write('\x1Bc');
      return true;
    case 'mode':
      if (['cli', 'chat', 'interpreter'].includes(args)) {
        mode = args;
        console.log(`Modo cambiado a ${args}.`);
      } else {
        console.log('Modo no reconocido. Usa cli, chat o interpreter.');
      }
      return true;
    case 'quit':
    case 'exit':
      console.log('Sesión terminada.');
      process.exit(0);
      return true;
    case 'cwd':
    case 'pwd':
      console.log(`Directorio actual: ${currentDir}`);
      return true;
    case 'shell':
      if (!args) {
        console.log('Uso: /shell <comando>');
        return true;
      }
      await executeShellCommand(args);
      return true;
    case 'stats':
      console.log(`Número de solicitudes AI: ${aiCount}`);
      console.log(`Número de comandos de intérprete: ${shellCount}`);
      return true;
    case 'history':
      if (commandHistory.length === 0) {
        console.log('No hay historial disponible.');
      } else {
        commandHistory.forEach((c, i) => {
          console.log(`${i + 1}: ${c}`);
        });
      }
      return true;
    case 'models': {
      // List available models
      console.log('Modelos disponibles:');
      MODELS.forEach((m) => console.log(`  ${m}`));
      console.log(`Modelo actual: ${currentModel}`);
      return true;
    }
    case 'model': {
      // Set the current model
      const newModel = args.trim();
      if (!newModel) {
        console.log(`Uso: /model <nombre>. Modelo actual: ${currentModel}`);
        return true;
      }
      if (MODELS.includes(newModel)) {
        currentModel = newModel;
        console.log(`Modelo actualizado a ${currentModel}`);
      } else {
        console.log(`Modelo no reconocido. Usa /models para listar.`);
      }
      return true;
    }
    case 'time': {
      // Show current date/time in the user's locale
      const now = new Date();
      console.log(`Hora actual: ${now.toLocaleString()}`);
      return true;
    }
    case 'reset': {
      // Reset counters and history
      aiCount = 0;
      shellCount = 0;
      commandHistory.length = 0;
      conversation = [];
      console.log('Se han restablecido estadísticas e historial.');
      return true;
    }
    case 'auto': {
      // Enable automatic model selection (use first model)
      currentModel = MODELS[0];
      console.log(`Modelo establecido en modo automático (${currentModel}).`);
      return true;
    }
    case 'echo': {
      // Echo back the provided text
      if (!args) {
        console.log('Uso: /echo <texto>');
      } else {
        console.log(args);
      }
      return true;
    }
    case 'count': {
      // Count characters in the provided text
      if (!args) {
        console.log('Uso: /count <texto>');
      } else {
        console.log(`Longitud: ${args.length}`);
      }
      return true;
    }
    case 'version': {
      console.log(`Versión: ${VERSION}`);
      return true;
    }
    case 'save': {
      const file = args.trim() || 'conversation.json';
      try {
        fs.writeFileSync(file, JSON.stringify(conversation, null, 2));
        console.log(`Conversación guardada en ${file}`);
      } catch (err) {
        console.log(`Error al guardar: ${err.message}`);
      }
      return true;
    }
    case 'load': {
      if (!args) {
        console.log('Uso: /load <archivo>');
        return true;
      }
      try {
        const data = fs.readFileSync(args.trim(), 'utf8');
        conversation = JSON.parse(data);
        console.log('Conversación cargada.');
      } catch (err) {
        console.log(`Error al cargar: ${err.message}`);
      }
      return true;
    }
    case 'date': {
      // Show current date
      const d = new Date();
      console.log(`Fecha actual: ${d.toLocaleDateString()}`);
      return true;
    }
    default:
      return false;
  }
}

/**
 * Execute a shell command relative to the persistent currentDir.
 * For security reasons certain destructive commands are disallowed.
 * Output is streamed back to the console when complete. If the
 * command is a change directory request, the currentDir will be
 * updated instead of spawning a process.
 *
 * @param {string} command The shell command to execute.
 */
async function executeShellCommand(command) {
  const trimmed = command.trim();
  // Basic sanitisation: forbid commands that include certain keywords
  const forbidden = ['rm', 'shutdown', 'reboot', 'sudo'];
  if (forbidden.some((f) => trimmed.includes(f))) {
    console.log('Error: Comando prohibido.');
    return;
  }
  // Handle 'cd' as a special case to update currentDir
  if (trimmed === 'cd' || trimmed.startsWith('cd ')) {
    const parts = trimmed.split(/\s+/);
    let target = parts[1] || process.env.HOME || process.cwd();
    // Resolve relative paths based on currentDir
    const newDir = path.resolve(currentDir, target);
    try {
      const stats = fs.statSync(newDir);
      if (stats.isDirectory()) {
        currentDir = newDir;
        console.log('');
      } else {
        console.log(`No existe el directorio: ${target}`);
      }
    } catch (err) {
      console.log(`No existe el directorio: ${target}`);
    }
    return;
  }
  return new Promise((resolve) => {
    exec(trimmed, { cwd: currentDir, timeout: 5000 }, (error, stdout, stderr) => {
      let output = '';
      if (error) output += error.message;
      if (stdout) output += stdout;
      if (stderr) output += stderr;
      process.stdout.write(output);
      // Count shell commands only if they produce an output or were executed
      shellCount++;
      resolve();
    });
  });
}

/**
 * Handle a user input line based on the current mode. Slash
 * commands (starting with '/') are processed separately. Other
 * input is delegated to either the AI or shell depending on
 * `mode`. This function also updates statistics and history.
 *
 * @param {string} line The raw input line (without newline).
 */
async function handleLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return;
  // Enforce maximum input length
  if (trimmed.length > MAX_INPUT_LENGTH) {
    console.log(`Error: entrada demasiado larga (máximo ${MAX_INPUT_LENGTH} caracteres).`);
    return;
  }
  // Slash commands override all modes
  if (trimmed.startsWith('/')) {
    const handled = await handleSlashCommand(trimmed);
    if (handled) {
      // Do not record slash commands in history
      return;
    }
  }
  switch (mode) {
    case 'cli':
    case 'chat': {
      // Both cli and chat modes produce AI responses, the only
      // difference is in presentation which is not relevant in
      // this terminal version. We simply call the AI and print
      // the response.
      commandHistory.push(trimmed);
      aiCount++;
      try {
        const response = await callG4F(trimmed);
        if (response) {
          console.log(response);
        } else {
          console.log('Sin respuesta del modelo.');
        }
      } catch (err) {
        console.log(`[Error] ${err.message}`);
      }
      break;
    }
    case 'interpreter':
    default: {
      commandHistory.push(trimmed);
      await executeShellCommand(trimmed);
      break;
    }
  }
}

// Create a readline interface to process standard input line by line.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});

console.log('Bienvenido al CLI unificado de g4f. Escribe /help para la ayuda.');
printPrompt();

rl.on('line', async (line) => {
  await handleLine(line);
  printPrompt();
});

rl.on('close', () => {
  console.log('Sesión terminada.');
  process.exit(0);
});
