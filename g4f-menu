#!/usr/bin/env node
/*
 * Menú interactivo para lanzar distintas herramientas del proyecto.
 * Permite elegir entre la CLI, la interfaz web o las utilidades de
 * "xdtest" (Cyrah). Tras finalizar cada herramienta, vuelve al menú.
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

// Use the current Node.js executable to avoid relying on `node`
// being present in the PATH. This improves compatibility across
// environments where the command might not be directly accessible
// (e.g. installations via nvm or custom setups).
const NODE_PATH = process.execPath;

const options = [
  { label: 'Abrir CLI', script: 'g4f-cli' },
  { label: 'Abrir interfaz web', script: 'gemini-web' },
  { label: 'Ejecutar Cyrah', script: path.join('xdtest', 'dist', 'bin', 'cyrah.js') },
  { label: 'Salir', script: null }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\nSeleccione una opción:\n');
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt.label}`));
  rl.question('> ', (answer) => {
    const index = parseInt(answer, 10) - 1;
    runOption(index);
  });
}

function runOption(index) {
  const opt = options[index];
  if (!opt) {
    console.log('Opción inválida.');
    return showMenu();
  }
  if (!opt.script) {
    console.log('Hasta luego.');
    rl.close();
    return;
  }
  rl.pause();
  const scriptPath = path.join(__dirname, opt.script);
  const child = spawn(NODE_PATH, [scriptPath], { stdio: 'inherit' });

  // When the spawned process finishes, resume the menu.
  child.on('exit', () => {
    rl.resume();
    showMenu();
  });

  // If the child process could not be executed, inform the user and
  // return to the menu instead of crashing.
  child.on('error', (err) => {
    console.error(`No se pudo ejecutar ${scriptPath}:`, err.message);
    rl.resume();
    showMenu();
  });
}

console.log('Menú principal de g4f');
showMenu();

