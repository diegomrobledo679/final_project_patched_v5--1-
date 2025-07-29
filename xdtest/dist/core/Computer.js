var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn, exec } from "child_process";
import { logger } from "../utils/logger.js";
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import * as os from "os";
import { Role, MessageType } from "../core/types.js";
export class Computer {
    constructor(interpreter) {
        this.skills = {};
        this.interpreter = interpreter;
    }
    loadSkills() {
        return __awaiter(this, arguments, void 0, function* (skillsPath = "./skills") {
            const fullSkillsPath = path.resolve(process.cwd(), skillsPath);
            if (!fs.existsSync(fullSkillsPath)) {
                logger.info(`Skills directory not found at ${fullSkillsPath}. Skipping skill loading.`);
                return;
            }
            logger.info(`Loading skills from ${fullSkillsPath}...`);
            const skillFiles = fs.readdirSync(fullSkillsPath);
            for (const file of skillFiles) {
                if (file.endsWith(".ts") || file.endsWith(".js")) {
                    const ext = path.extname(file);
                    const skillName = path.basename(file, ext);
                    try {
                        const modulePath = path.join(fullSkillsPath, file);
                        const skillModule = yield import(pathToFileURL(modulePath).href);
                        if (skillModule.default && typeof skillModule.default === 'function') {
                            this.skills[skillName] = skillModule.default;
                            logger.info(`Loaded skill: ${skillName}`);
                        }
                        else {
                            logger.warn(`Skill ${skillName} does not have a default export or it's not a function.`);
                        }
                    }
                    catch (error) {
                        logger.error(`Failed to load skill ${skillName}:`, error);
                    }
                }
            }
        });
    }
    checkCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const checkCmd = os.platform() === 'win32' ? `where ${command}` : `which ${command}`;
                exec(checkCmd, (error) => {
                    resolve(!error);
                });
            });
        });
    }
    installPackage(packageManager, pkg) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let installCmd;
                switch (packageManager) {
                    case 'apt':
                        installCmd = `sudo apt-get update && sudo apt-get install -y ${pkg}`;
                        break;
                    case 'yum':
                        installCmd = `sudo yum install -y ${pkg}`;
                        break;
                    case 'dnf':
                        installCmd = `sudo dnf install -y ${pkg}`;
                        break;
                    case 'pacman':
                        installCmd = `sudo pacman -S --noconfirm ${pkg}`;
                        break;
                    case 'zypper':
                        installCmd = `sudo zypper install -y ${pkg}`;
                        break;
                    case 'brew':
                        installCmd = `brew install ${pkg}`;
                        break;
                    case 'choco':
                        installCmd = `choco install ${pkg} -y`;
                        break;
                    case 'npm':
                        installCmd = `npm install -g ${pkg}`;
                        break;
                    case 'pip':
                        installCmd = `pip install ${pkg}`;
                        break;
                    case 'rustup':
                        installCmd = `curl --proto =https --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`;
                        break;
                    default:
                        logger.warn(`Unsupported package manager: ${packageManager}`);
                        return resolve(false);
                }
                logger.info(`Attempting to install ${pkg} using ${packageManager}: ${installCmd}`);
                exec(installCmd, (error, stdout, stderr) => {
                    if (error) {
                        logger.error(`Failed to install ${pkg}: ${stderr}`);
                        resolve(false);
                    }
                    else {
                        logger.info(`${pkg} installed successfully.`);
                        resolve(true);
                    }
                });
            });
        });
    }
    setupEnvironment(language) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`Setting up environment for ${language}.`);
            const platform = os.platform();
            const getPackageManager = () => __awaiter(this, void 0, void 0, function* () {
                if (platform === 'linux') {
                    if (yield this.checkCommand('apt-get'))
                        return 'apt';
                    if (yield this.checkCommand('yum'))
                        return 'yum';
                    if (yield this.checkCommand('dnf'))
                        return 'dnf';
                    if (yield this.checkCommand('pacman'))
                        return 'pacman';
                    if (yield this.checkCommand('zypper'))
                        return 'zypper';
                }
                else if (platform === 'darwin') {
                    if (yield this.checkCommand('brew'))
                        return 'brew';
                }
                else if (platform === 'win32') {
                    if (yield this.checkCommand('choco'))
                        return 'choco';
                }
                return null;
            });
            const packageManager = yield getPackageManager();
            const ensureCommand = (command_1, pkg_1, ...args_1) => __awaiter(this, [command_1, pkg_1, ...args_1], void 0, function* (command, pkg, pkgManager = packageManager) {
                if (yield this.checkCommand(command)) {
                    logger.info(`${command} is already installed.`);
                    return;
                }
                logger.warn(`${command} not found. Attempting to install ${pkg}...`);
                if (pkgManager && (yield this.installPackage(pkgManager, pkg))) {
                    logger.info(`${command} installed successfully.`);
                }
                else {
                    const errorMessage = `Required command ${command} not found and could not be installed automatically. Please install ${pkg} manually.`;
                    logger.error(errorMessage);
                    throw new Error(errorMessage);
                }
            });
            switch (language.toLowerCase()) {
                case 'python':
                    yield ensureCommand('python3', 'python3');
                    yield ensureCommand('pip3', 'python3-pip');
                    const venvPath = path.join(process.cwd(), '.venv');
                    if (!fs.existsSync(venvPath)) {
                        logger.info("Python virtual environment not found. Creating one...");
                        yield new Promise((resolve, reject) => {
                            exec('python3 -m venv .venv', (error, stdout, stderr) => {
                                if (error) {
                                    logger.error(`Failed to create Python venv: ${stderr}`);
                                    reject(error);
                                }
                                else {
                                    logger.info("Python venv created successfully.");
                                    resolve();
                                }
                            });
                        });
                    }
                    break;
                case 'javascript':
                    yield ensureCommand('node', 'nodejs');
                    yield ensureCommand('npm', 'npm');
                    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
                    if (!fs.existsSync(nodeModulesPath)) {
                        logger.info("node_modules not found. Running npm install...");
                        yield new Promise((resolve, reject) => {
                            exec('npm install', (error, stdout, stderr) => {
                                if (error) {
                                    logger.error(`Failed to run npm install: ${stderr}`);
                                    reject(error);
                                }
                                else {
                                    logger.info("npm install completed successfully.");
                                    resolve();
                                }
                            });
                        });
                    }
                    break;
                case 'ruby':
                    yield ensureCommand('ruby', 'ruby');
                    break;
                case 'perl':
                    yield ensureCommand('perl', 'perl');
                    break;
                case 'php':
                    yield ensureCommand('php', 'php');
                    break;
                case 'powershell':
                    yield ensureCommand('pwsh', 'powershell');
                    break;
                case 'java':
                    yield ensureCommand('javac', 'default-jdk');
                    yield ensureCommand('java', 'default-jre');
                    break;
                case 'go':
                    yield ensureCommand('go', 'golang');
                    break;
                case 'cpp':
                    yield ensureCommand('g++', 'build-essential');
                    break;
                case 'rust':
                    yield ensureCommand('rustc', 'rustup');
                    break;
                case 'swift':
                    yield ensureCommand('swift', 'swift');
                    break;
                case 'csharp':
                    yield ensureCommand('dotnet', 'dotnet-sdk');
                    break;
                case 'kotlin':
                    yield ensureCommand('kotlinc', 'kotlin');
                    break;
                case 'r':
                    yield ensureCommand('Rscript', 'r-base');
                    break;
                case 'typescript':
                    yield ensureCommand('tsc', 'typescript', 'npm');
                    yield ensureCommand('ts-node', 'ts-node', 'npm');
                    break;
                case 'groovy':
                    yield ensureCommand('groovy', 'groovy');
                    break;
                case 'scala':
                    yield ensureCommand('scala', 'scala');
                    break;
                case 'shell': break; // Shell is assumed to be present
                case 'c':
                    yield ensureCommand('gcc', 'build-essential');
                    break;
                case 'fortran':
                    yield ensureCommand('gfortran', 'gfortran');
                    break;
                case 'lua':
                    yield ensureCommand('lua', 'lua');
                    break;
                case 'haskell':
                    yield ensureCommand('runghc', 'haskell-platform');
                    break;
                case 'erlang':
                    yield ensureCommand('escript', 'erlang');
                    break;
                case 'elixir':
                    yield ensureCommand('elixir', 'elixir');
                    break;
                default:
                    logger.warn(`No specific environment setup for language: ${language}`);
            }
        });
    }
    execute(language, code) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`Executing ${language} code...`);
            if (this.interpreter.safeMode === "strict" && (code.includes("fs.writeFileSync") || code.includes("fs.unlinkSync"))) {
                return "Error: File system write operations are restricted in strict safe mode.";
            }
            try {
                yield this.setupEnvironment(language);
            }
            catch (error) {
                return `Environment setup failed: ${error.message}`;
            }
            if (this.skills[language]) {
                return this.skills[language](this.interpreter, code);
            }
            const cleanupFiles = [];
            const cleanup = () => {
                cleanupFiles.forEach(file => {
                    try {
                        if (fs.existsSync(file)) {
                            fs.rmSync(file, { recursive: true, force: true });
                            logger.debug(`Cleaned up temporary file/directory: ${file}`);
                        }
                    }
                    catch (e) {
                        logger.error(`Failed to cleanup file ${file}:`, e);
                    }
                });
            };
            try {
                return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    let cmd = "";
                    let args = [];
                    const timeout = 60000; // 60 seconds
                    const writeTempFile = (content, extension) => {
                        const tempDir = os.tmpdir();
                        const fileName = `temp_script_${Date.now()}.${extension}`;
                        const filePath = path.join(tempDir, fileName);
                        fs.writeFileSync(filePath, content);
                        cleanupFiles.push(filePath);
                        return filePath;
                    };
                    const compileAndRun = (compileCmd, runCmd, runArgs) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolveCompile, rejectCompile) => {
                            exec(compileCmd, (error, stdout, stderr) => {
                                if (error) {
                                    const errorMsg = `Compilation error: ${stderr || stdout}`;
                                    this.interpreter.streamOutput({ role: Role.Computer, messageType: MessageType.Console, content: errorMsg + '\n' });
                                    rejectCompile(new Error(errorMsg));
                                }
                                else {
                                    resolveCompile();
                                }
                            });
                        });
                        cmd = runCmd;
                        args = runArgs;
                    });
                    switch (language.toLowerCase()) {
                        case "python":
                            const pythonExecutable = path.join(process.cwd(), '.venv', 'bin', 'python');
                            cmd = fs.existsSync(pythonExecutable) ? pythonExecutable : 'python3';
                            args = [writeTempFile(code, 'py')];
                            break;
                        case "javascript":
                            cmd = 'node';
                            args = [writeTempFile(code, 'js')];
                            break;
                        case "shell":
                            if (os.platform() === 'win32') {
                                cmd = "powershell.exe";
                                args = ["-File", writeTempFile(code, 'ps1')];
                            }
                            else {
                                cmd = "/bin/sh";
                                args = [writeTempFile(code, 'sh')];
                            }
                            break;
                        case "ruby":
                            cmd = "ruby";
                            args = [writeTempFile(code, 'rb')];
                            break;
                        case "perl":
                            cmd = "perl";
                            args = [writeTempFile(code, 'pl')];
                            break;
                        case "php":
                            cmd = "php";
                            args = [writeTempFile(code, 'php')];
                            break;
                        case "powershell":
                            cmd = "pwsh";
                            args = ["-File", writeTempFile(code, 'ps1')];
                            break;
                        case "java": {
                            const className = `Main${Date.now()}`;
                            const javaFile = path.join(os.tmpdir(), `${className}.java`);
                            const classDir = os.tmpdir();
                            fs.writeFileSync(javaFile, code.replace(/public class \w+/, `public class ${className}`));
                            cleanupFiles.push(javaFile, path.join(classDir, `${className}.class`));
                            yield compileAndRun(`javac -d ${classDir} ${javaFile}`, "java", ["-cp", classDir, className]);
                            break;
                        }
                        case "go": {
                            const goFile = writeTempFile(code, 'go');
                            cmd = "go";
                            args = ["run", goFile];
                            break;
                        }
                        case "cpp": {
                            const execName = `a.out_${Date.now()}`;
                            const cppFile = writeTempFile(code, 'cpp');
                            const execPath = path.join(os.tmpdir(), execName);
                            cleanupFiles.push(execPath);
                            yield compileAndRun(`g++ ${cppFile} -o ${execPath}`, execPath, []);
                            break;
                        }
                        case "rust": {
                            const execName = `rust_exec_${Date.now()}`;
                            const rustFile = writeTempFile(code, 'rs');
                            const execPath = path.join(os.tmpdir(), execName);
                            cleanupFiles.push(execPath);
                            yield compileAndRun(`rustc ${rustFile} -o ${execPath}`, execPath, []);
                            break;
                        }
                        case "swift":
                            cmd = "swift";
                            args = [writeTempFile(code, 'swift')];
                            break;
                        case "csharp": {
                            const csharpProjectName = `CSharpProject_${Date.now()}`;
                            const csharpProjectDir = path.join(os.tmpdir(), csharpProjectName);
                            fs.mkdirSync(csharpProjectDir, { recursive: true });
                            const csharpFilePath = path.join(csharpProjectDir, "Program.cs");
                            fs.writeFileSync(csharpFilePath, code);
                            cleanupFiles.push(csharpProjectDir); // Add project directory to cleanup
                            yield compileAndRun(`dotnet build ${csharpProjectDir} --nologo`, `dotnet`, ["run", "--project", csharpProjectDir, "--nologo"]);
                            break;
                        }
                        case "kotlin": {
                            const kotlinJarName = `Main_${Date.now()}.jar`;
                            const kotlinFilePath = writeTempFile(code, 'kt');
                            const jarPath = path.join(os.tmpdir(), kotlinJarName);
                            cleanupFiles.push(jarPath);
                            yield compileAndRun(`kotlinc ${kotlinFilePath} -include-runtime -d ${jarPath}`, `java`, ["-jar", jarPath]);
                            break;
                        }
                        case "r":
                            cmd = "Rscript";
                            args = [writeTempFile(code, 'R')];
                            break;
                        case "typescript":
                            cmd = "ts-node";
                            args = [writeTempFile(code, 'ts')];
                            break;
                        case "groovy":
                            cmd = "groovy";
                            args = [writeTempFile(code, 'groovy')];
                            break;
                        case "scala":
                            cmd = "scala";
                            args = [writeTempFile(code, 'scala')];
                            break;
                        case "c": {
                            const execName = `c_exec_${Date.now()}`;
                            const cFile = writeTempFile(code, 'c');
                            const execPath = path.join(os.tmpdir(), execName);
                            cleanupFiles.push(execPath);
                            yield compileAndRun(`gcc ${cFile} -o ${execPath}`, execPath, []);
                            break;
                        }
                        case "fortran": {
                            const execName = `fortran_exec_${Date.now()}`;
                            const fortranFile = writeTempFile(code, 'f90'); // Common Fortran extension
                            const execPath = path.join(os.tmpdir(), execName);
                            cleanupFiles.push(execPath);
                            yield compileAndRun(`gfortran ${fortranFile} -o ${execPath}`, execPath, []);
                            break;
                        }
                        case "lua":
                            cmd = "lua";
                            args = [writeTempFile(code, 'lua')];
                            break;
                        case "haskell":
                            cmd = "runghc";
                            args = [writeTempFile(code, 'hs')];
                            break;
                        case "erlang":
                            cmd = "escript";
                            args = [writeTempFile(code, 'erl')];
                            break;
                        case "elixir":
                            cmd = "elixir";
                            args = [writeTempFile(code, 'exs')];
                            break;
                        default:
                            const errorMessage = `Unsupported language: ${language}`;
                            this.interpreter.streamOutput({ role: Role.Computer, messageType: MessageType.Console, content: errorMessage + '\n' });
                            return reject(new Error(errorMessage));
                    }
                    if (!cmd) {
                        return reject(new Error("Command not set for execution."));
                    }
                    const child = spawn(cmd, args, { cwd: process.cwd() });
                    let output = "";
                    const timer = setTimeout(() => {
                        child.kill();
                        const errorMessage = `Execution timed out after ${timeout / 1000} seconds.`;
                        logger.error(errorMessage);
                        reject(new Error(errorMessage));
                    }, timeout);
                    child.stdout.on("data", (data) => {
                        output += data.toString();
                        this.interpreter.streamOutput({ role: Role.Computer, messageType: MessageType.Console, content: data.toString() });
                    });
                    child.stderr.on("data", (data) => {
                        output += data.toString();
                        this.interpreter.streamOutput({ role: Role.Computer, messageType: MessageType.Console, content: data.toString() });
                    });
                    child.on("close", (code) => {
                        clearTimeout(timer);
                        if (code !== 0) {
                            const errorMessage = `Execution failed with code ${code}. Output:\n${output}`;
                            logger.error(errorMessage);
                            reject(new Error(errorMessage));
                        }
                        else {
                            if (output.length > this.interpreter.maxOutput) {
                                output = output.substring(0, this.interpreter.maxOutput) + "... (output truncated)";
                            }
                            logger.info(`Code executed successfully. Output: ${output}`);
                            resolve(output || `Execution of ${language} code completed with no output.`);
                        }
                    });
                    child.on("error", (err) => {
                        clearTimeout(timer);
                        const errorMessage = `Execution error: ${err.message}`;
                        logger.error(errorMessage);
                        reject(err);
                    });
                }));
            }
            finally {
                cleanup();
            }
        });
    }
}
