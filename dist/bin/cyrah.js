#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
import readline from 'readline';
import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { executeLaunchUITool, executePlaySpotifyTool } from '../tools/SystemIntegrationTool.js';
import { executeOpenUrlTool } from '../tools/OpenUrlTool.js';
import { executeOpenPathTool } from '../tools/OpenPathTool.js';
import { executeSendEmailTool } from '../tools/EmailTool.js';
import { executeListLanguagesTool } from '../tools/LanguageTool.js';
import { executeCheckSystemHealthTool } from '../tools/SystemDiagnosticsTool.js';
import { Interpreter } from "../core/Interpreter.js";
import { registerAllTools } from "../tools/register.js";
import { main } from '../main.js';
import { RELEVANT_ENV_VARS } from '../envVars.js';
dotenv.config();
function manageEnvVariables(ask) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\nCurrent environment variables:');
        for (const key of RELEVANT_ENV_VARS) {
            if (process.env[key]) {
                console.log(`${key}=${process.env[key]}`);
            }
        }
        while (true) {
            const pair = (yield ask('Enter KEY=VALUE to set, KEY to unset (blank to finish): ')).trim();
            if (!pair)
                break;
            if (!pair.includes('=')) {
                delete process.env[pair];
                console.log(`Unset ${pair}`);
            }
            else {
                const [key, ...rest] = pair.split('=');
                if (key && rest.length > 0) {
                    process.env[key] = rest.join('=');
                    console.log(`Set ${key}=${process.env[key]}`);
                }
            }
        }
    });
}
function showMenu(cliPort) {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (query) => new Promise((res) => rl.question(query, res));
        while (true) {
            console.log('Cyrah Menu');
            console.log('1) Start CLI Interpreter');
            console.log('2) Start Web Interface');
            console.log('3) Start CLI and Web Interface');
            console.log('4) Launch UI');
            console.log('5) Start All (CLI, Web, UI)');
            console.log('6) Set Environment Variables');
            console.log('7) Load Environment File');
            console.log('8) Open URL in Browser');
            console.log('9) Open File or Folder');
            console.log('10) Play Spotify Track/Playlist');
            console.log('11) Send Email');
            console.log('12) Check System Health');
            console.log('13) List Available Tools');
            console.log('14) List Supported Languages');
            console.log('15) List Environment Variables');
            console.log('16) Exit');
            const choice = (yield ask('Choose an option: ')).trim();
            if (choice === '1') {
                rl.close();
                yield main();
                return;
            }
            else if (choice === '2') {
                if (cliPort)
                    process.env.PORT = String(cliPort);
                yield import('../server.js');
                console.log(`Web interface started. Open http://localhost:${process.env.PORT || 3000} in your browser.`);
            }
            else if (choice === '3') {
                if (cliPort)
                    process.env.PORT = String(cliPort);
                yield import('../server.js');
                console.log(`Web interface started. Open http://localhost:${process.env.PORT || 3000} in your browser.`);
                rl.close();
                yield main();
                return;
            }
            else if (choice === '4') {
                const msg = yield executeLaunchUITool({ uiName: process.env.UI_NAME || 'cyrah' });
                console.log(msg);
            }
            else if (choice === '5') {
                if (cliPort)
                    process.env.PORT = String(cliPort);
                yield import('../server.js');
                console.log(`Web interface started. Open http://localhost:${process.env.PORT || 3000} in your browser.`);
                process.env.DISPLAY_MODE = 'gui';
                rl.close();
                yield main();
                return;
            }
            else if (choice === '6') {
                yield manageEnvVariables(ask);
            }
            else if (choice === '7') {
                const file = yield ask('Path to .env file: ');
                try {
                    dotenv.config({ path: path.resolve(file) });
                    console.log(`Loaded environment variables from ${file}`);
                }
                catch (err) {
                    console.error(`Failed to load env file: ${err.message}`);
                }
            }
            else if (choice === '8') {
                try {
                    const url = yield ask('Enter URL: ');
                    const msg = yield executeOpenUrlTool({ url });
                    console.log(msg);
                }
                catch (err) {
                    console.error(err.message);
                }
            }
            else if (choice === '9') {
                try {
                    const p = yield ask('Enter file or folder path: ');
                    const msg = yield executeOpenPathTool({ path: p });
                    console.log(msg);
                }
                catch (err) {
                    console.error(err.message);
                }
            }
            else if (choice === '10') {
                try {
                    const uri = yield ask('Enter Spotify URI or URL: ');
                    const msg = yield executePlaySpotifyTool({ uri });
                    console.log(msg);
                }
                catch (err) {
                    console.error(err.message);
                }
            }
            else if (choice === '11') {
                try {
                    const to = yield ask('Recipient: ');
                    const subject = yield ask('Subject: ');
                    const text = yield ask('Message: ');
                    const msg = yield executeSendEmailTool({ to, subject, text });
                    console.log(msg);
                }
                catch (err) {
                    console.error(err.message);
                }
            }
            else if (choice === '12') {
                const msg = yield executeCheckSystemHealthTool();
                console.log(msg);
            }
            else if (choice === '13') {
                const interpreter = new Interpreter();
                registerAllTools(interpreter);
                interpreter.tools.forEach(t => console.log(`${t.function.name} - ${t.function.description}`));
            }
            else if (choice === '14') {
                const langs = yield executeListLanguagesTool();
                console.log(langs);
            }
            else if (choice === '15') {
                for (const key of RELEVANT_ENV_VARS) {
                    if (process.env[key]) {
                        console.log(`${key}=${process.env[key]}`);
                    }
                    else {
                        console.log(key);
                    }
                }
            }
            else if (choice === '16') {
                rl.close();
                return;
            }
        }
    });
}
export function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const argv = minimist(process.argv.slice(2), {
            string: [
                'env',
                'spotify',
                'send-email',
                'open-url',
                'open-path',
                'port',
                'env-file',
                'history-path',
                'conversation-file',
                'conversation-max'
            ],
            boolean: ['menu', 'help', 'web', 'gui', 'auto', 'list-tools', 'list-languages', 'version', 'list-env', 'check-health'],
            alias: {
                e: 'env',
                h: 'help',
                w: 'web',
                g: 'gui',
                a: 'auto',
                s: 'spotify',
                E: 'send-email',
                o: 'open-url',
                P: 'open-path',
                l: 'list-tools',
                L: 'list-languages',
                p: 'port',
                f: 'env-file',
                v: 'version',
                n: 'list-env',
                H: 'check-health',
                d: 'history-path',
                c: 'conversation-file',
                M: 'conversation-max'
            }
        });
        const envFile = argv['env-file'] || process.env.ENV_FILE;
        if (envFile) {
            try {
                dotenv.config({ path: path.resolve(envFile) });
            }
            catch (err) {
                console.error(`Failed to load env file ${envFile}: ${err.message}`);
            }
        }
        if (argv.help) {
            console.log(`Usage: cyrah [options]

Options:
  --menu, -m          Show interactive menu
  --web,  -w          Start the web interface alongside the CLI
  --gui,  -g          Open the graphical interface on start
  --no-menu           Skip automatic menu when no arguments are passed
  --auto, -a          Start CLI, web, and GUI automatically
  --spotify, -s URI   Play a Spotify URI or URL
  --send-email, -E STR Send an email (format: to;subject;text)
  --open-url, -o URL  Open a URL in the default browser
  --open-path, -P PTH Open a file or folder with the default app
  --port, -p NUM      Port for the web interface
  --history-path, -d  Directory for conversation logs
  --conversation-file, -c Name of the conversation history file
  --conversation-max, -M Max messages to keep in history
  --env-file, -f PATH Load environment variables from file
  --env,  -e KEY=VAL  Set environment variable (repeatable)
  --help, -h          Show this help message
  --list-tools, -l    List all available tools and exit
  --list-languages, -L List supported programming languages and exit
  --list-env, -n      List relevant environment variables and exit
  --check-health, -H  Run system health checks and exit
  --version, -v       Show CLI version and exit

Any other options are forwarded to the interpreter.`);
            return;
        }
        if (argv.version) {
            const pkgPath = path.resolve(fileURLToPath(new URL('../../package.json', import.meta.url)));
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            console.log(`cyrah version ${pkg.version}`);
            return;
        }
        if (argv.env) {
            const envs = Array.isArray(argv.env) ? argv.env : [argv.env];
            for (const pair of envs) {
                const [key, ...rest] = pair.split('=');
                if (key && rest.length > 0) {
                    process.env[key] = rest.join('=');
                }
            }
        }
        const spotifyEnv = process.env.SPOTIFY_URI;
        const openUrlEnv = process.env.OPEN_URL;
        const openPathEnv = process.env.OPEN_PATH;
        const emailToEnv = process.env.EMAIL_TO;
        const emailSubjectEnv = process.env.EMAIL_SUBJECT;
        const emailTextEnv = process.env.EMAIL_TEXT;
        const portEnv = process.env.PORT;
        const historyPathEnv = process.env.CONVERSATION_HISTORY_PATH;
        const convFileEnv = process.env.CONVERSATION_FILENAME;
        const convMaxEnv = process.env.CONVERSATION_MAX_LENGTH;
        const printVersionEnv = process.env.PRINT_VERSION === 'true';
        const autoEnv = process.env.AUTO_START === 'true';
        const webEnv = process.env.START_WEB === 'true';
        const guiEnv = process.env.START_GUI === 'true';
        const listToolsEnv = process.env.LIST_TOOLS === "true";
        const listLanguagesEnv = process.env.LIST_LANGUAGES === "true";
        const listEnvEnv = process.env.LIST_ENV === "true";
        const checkHealthEnv = process.env.CHECK_HEALTH === "true";
        if (!argv.version && printVersionEnv) {
            argv.version = true;
        }
        if (!argv.spotify && spotifyEnv) {
            argv.spotify = spotifyEnv;
        }
        if (!argv['open-url'] && openUrlEnv) {
            argv['open-url'] = openUrlEnv;
        }
        if (!argv['open-path'] && openPathEnv) {
            argv['open-path'] = openPathEnv;
        }
        if (!argv['send-email'] && emailToEnv && emailSubjectEnv && emailTextEnv) {
            argv['send-email'] = `${emailToEnv};${emailSubjectEnv};${emailTextEnv}`;
        }
        if (!argv.port && portEnv) {
            argv.port = portEnv;
        }
        if (!argv['history-path'] && historyPathEnv) {
            argv['history-path'] = historyPathEnv;
        }
        if (!argv['conversation-file'] && convFileEnv) {
            argv['conversation-file'] = convFileEnv;
        }
        if (!argv['conversation-max'] && convMaxEnv) {
            argv['conversation-max'] = convMaxEnv;
        }
        if (autoEnv) {
            argv.auto = true;
        }
        if (webEnv) {
            argv.web = true;
        }
        if (guiEnv) {
            argv.gui = true;
        }
        if (argv.gui || argv.auto || guiEnv || autoEnv) {
            process.env.DISPLAY_MODE = 'gui';
        }
        if (!argv["list-tools"] && listToolsEnv) {
            argv["list-tools"] = true;
        }
        if (!argv["list-languages"] && listLanguagesEnv) {
            argv["list-languages"] = true;
        }
        if (!argv["list-env"] && listEnvEnv) {
            argv["list-env"] = true;
        }
        if (!argv["check-health"] && checkHealthEnv) {
            argv["check-health"] = true;
        }
        if (argv.auto || autoEnv) {
            argv.web = true;
        }
        const skipMenu = process.env.NO_MENU === 'true';
        const hasNoArgs = process.argv.slice(2).length === 0;
        const showMenuFlag = argv.menu === true || (hasNoArgs && argv.menu !== false && !skipMenu);
        if (showMenuFlag) {
            yield showMenu(argv.port ? String(argv.port) : undefined);
            return;
        }
        if (argv.web) {
            if (argv.port)
                process.env.PORT = String(argv.port);
            yield import('../server.js');
            console.log(`Web interface started. Open http://localhost:${process.env.PORT || 3000} in your browser.`);
        }
        if (argv.spotify) {
            const msg = yield executePlaySpotifyTool({ uri: argv.spotify });
            console.log(msg);
        }
        if (argv['open-url']) {
            const msg = yield executeOpenUrlTool({ url: argv['open-url'] });
            console.log(msg);
        }
        if (argv['open-path']) {
            const msg = yield executeOpenPathTool({ path: argv['open-path'] });
            console.log(msg);
        }
        if (argv['send-email']) {
            const [to, subject, text] = argv['send-email'].split(';');
            if (to && subject && text) {
                const msg = yield executeSendEmailTool({ to, subject, text });
                console.log(msg);
            }
            else {
                console.error('Invalid --send-email format. Use "to;subject;text"');
            }
        }
        if (argv["list-tools"]) {
            const interpreter = new Interpreter();
            registerAllTools(interpreter);
            interpreter.tools.forEach(t => console.log(`${t.function.name} - ${t.function.description}`));
            return;
        }
        if (argv["list-languages"]) {
            const langs = yield executeListLanguagesTool();
            console.log(langs);
            return;
        }
        if (argv["list-env"]) {
            for (const key of RELEVANT_ENV_VARS) {
                if (process.env[key]) {
                    console.log(`${key}=${process.env[key]}`);
                }
                else {
                    console.log(key);
                }
            }
            return;
        }
        if (argv["check-health"]) {
            const msg = yield executeCheckSystemHealthTool();
            console.log(msg);
            return;
        }
        yield main();
    });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run().catch(err => {
        console.error(`Error: ${err.message}`);
    });
}
