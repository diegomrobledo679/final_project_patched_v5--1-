import { spawn, exec } from "child_process";
import { logger } from "../utils/logger.js";
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import { Interpreter } from "./Interpreter.js";
import * as os from "os";
import { Role, MessageType } from "../core/types.js";

export class Computer {
  private interpreter: Interpreter;
  public skills: { [key: string]: any; path?: string | null; importSkills?: boolean; } = {};

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  public async loadSkills(skillsPath: string = "./skills") {
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
          const skillModule = await import(pathToFileURL(modulePath).href);
          if (skillModule.default && typeof skillModule.default === 'function') {
            this.skills[skillName] = skillModule.default;
            logger.info(`Loaded skill: ${skillName}`);
          } else {
            logger.warn(`Skill ${skillName} does not have a default export or it's not a function.`);
          }
        } catch (error) {
          logger.error(`Failed to load skill ${skillName}:`, error);
        }
      }
    }
  }

  private async checkCommand(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      const checkCmd = os.platform() === 'win32' ? `where ${command}` : `which ${command}`;
      exec(checkCmd, (error) => {
        resolve(!error);
      });
    });
  }

  private async installPackage(packageManager: string, pkg: string): Promise<boolean> {
    return new Promise((resolve) => {
      let installCmd: string;
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
        } else {
          logger.info(`${pkg} installed successfully.`);
          resolve(true);
        }
      });
    });
  }

  private async setupEnvironment(language: string): Promise<void> {
    logger.info(`Setting up environment for ${language}.`);
    const platform = os.platform();

    const getPackageManager = async (): Promise<string | null> => {
        if (platform === 'linux') {
            if (await this.checkCommand('apt-get')) return 'apt';
            if (await this.checkCommand('yum')) return 'yum';
            if (await this.checkCommand('dnf')) return 'dnf';
            if (await this.checkCommand('pacman')) return 'pacman';
            if (await this.checkCommand('zypper')) return 'zypper';
        } else if (platform === 'darwin') {
            if (await this.checkCommand('brew')) return 'brew';
        } else if (platform === 'win32') {
            if (await this.checkCommand('choco')) return 'choco';
        }
        return null;
    };

    const packageManager = await getPackageManager();

    const ensureCommand = async (command: string, pkg: string, pkgManager: string | null = packageManager): Promise<void> => {
      if (await this.checkCommand(command)) {
        logger.info(`${command} is already installed.`);
        return;
      }
      logger.warn(`${command} not found. Attempting to install ${pkg}...`);
      if (pkgManager && await this.installPackage(pkgManager, pkg)) {
        logger.info(`${command} installed successfully.`);
      } else {
        const errorMessage = `Required command ${command} not found and could not be installed automatically. Please install ${pkg} manually.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }
    };

    switch (language.toLowerCase()) {
        case 'python':
            await ensureCommand('python3', 'python3');
            await ensureCommand('pip3', 'python3-pip');
            const venvPath = path.join(process.cwd(), '.venv');
            if (!fs.existsSync(venvPath)) {
                logger.info("Python virtual environment not found. Creating one...");
                await new Promise<void>((resolve, reject) => {
                    exec('python3 -m venv .venv', (error, stdout, stderr) => {
                        if (error) {
                            logger.error(`Failed to create Python venv: ${stderr}`);
                            reject(error);
                        } else {
                            logger.info("Python venv created successfully.");
                            resolve();
                        }
                    });
                });
            }
            break;
        case 'javascript':
            await ensureCommand('node', 'nodejs');
            await ensureCommand('npm', 'npm');
            const nodeModulesPath = path.join(process.cwd(), 'node_modules');
            if (!fs.existsSync(nodeModulesPath)) {
                logger.info("node_modules not found. Running npm install...");
                await new Promise<void>((resolve, reject) => {
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
        case 'ruby': await ensureCommand('ruby', 'ruby'); break;
        case 'perl': await ensureCommand('perl', 'perl'); break;
        case 'php': await ensureCommand('php', 'php'); break;
        case 'powershell': await ensureCommand('pwsh', 'powershell'); break;
        case 'java': await ensureCommand('javac', 'default-jdk'); await ensureCommand('java', 'default-jre'); break;
        case 'go': await ensureCommand('go', 'golang'); break;
        case 'cpp': await ensureCommand('g++', 'build-essential'); break;
        case 'rust': await ensureCommand('rustc', 'rustup'); break;
        case 'swift': await ensureCommand('swift', 'swift'); break;
        case 'csharp': await ensureCommand('dotnet', 'dotnet-sdk'); break;
        case 'kotlin': await ensureCommand('kotlinc', 'kotlin'); break;
        case 'r': await ensureCommand('Rscript', 'r-base'); break;
        case 'typescript': await ensureCommand('tsc', 'typescript', 'npm'); await ensureCommand('ts-node', 'ts-node', 'npm'); break;
        case 'groovy': await ensureCommand('groovy', 'groovy'); break;
        case 'scala': await ensureCommand('scala', 'scala'); break;
        case 'shell': break; // Shell is assumed to be present
        case 'c': await ensureCommand('gcc', 'build-essential'); break;
        case 'fortran': await ensureCommand('gfortran', 'gfortran'); break;
        case 'lua': await ensureCommand('lua', 'lua'); break;
        case 'haskell': await ensureCommand('runghc', 'haskell-platform'); break;
        case 'erlang': await ensureCommand('escript', 'erlang'); break;
        case 'elixir': await ensureCommand('elixir', 'elixir'); break;
        default:
            logger.warn(`No specific environment setup for language: ${language}`);
    }
  }

  public async execute(language: string, code: string): Promise<string> {
    logger.info(`Executing ${language} code...`);

    if (this.interpreter.safeMode === "strict" && (code.includes("fs.writeFileSync") || code.includes("fs.unlinkSync"))) {
      return "Error: File system write operations are restricted in strict safe mode.";
    }

    try {
      await this.setupEnvironment(language);
    } catch (error: any) {
      return `Environment setup failed: ${error.message}`;
    }

    if (this.skills[language]) {
      return this.skills[language](this.interpreter, code);
    }

    const cleanupFiles: string[] = [];
    const cleanup = () => {
        cleanupFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.rmSync(file, { recursive: true, force: true });
                    logger.debug(`Cleaned up temporary file/directory: ${file}`);
                }
            } catch (e) {
                logger.error(`Failed to cleanup file ${file}:`, e);
            }
        });
    };

    try {
        return await new Promise(async (resolve, reject) => {
            let cmd: string = "";
            let args: string[] = [];
            const timeout = 60000; // 60 seconds

            const writeTempFile = (content: string, extension: string): string => {
                const tempDir = os.tmpdir();
                const fileName = `temp_script_${Date.now()}.${extension}`;
                const filePath = path.join(tempDir, fileName);
                fs.writeFileSync(filePath, content);
                cleanupFiles.push(filePath);
                return filePath;
            };

            const compileAndRun = async (compileCmd: string, runCmd: string, runArgs: string[]) => {
                await new Promise<void>((resolveCompile, rejectCompile) => {
                    exec(compileCmd, (error, stdout, stderr) => {
                        if (error) {
                            const errorMsg = `Compilation error: ${stderr || stdout}`;
                            this.interpreter.streamOutput({ role: Role.Computer, messageType: MessageType.Console, content: errorMsg + '\n' });
                            rejectCompile(new Error(errorMsg));
                        } else {
                            resolveCompile();
                        }
                    });
                });
                cmd = runCmd;
                args = runArgs;
            };

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
                    } else {
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
                    await compileAndRun(`javac -d ${classDir} ${javaFile}`, "java", ["-cp", classDir, className]);
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
                    await compileAndRun(`g++ ${cppFile} -o ${execPath}`, execPath, []);
                    break;
                }
                case "rust": {
                    const execName = `rust_exec_${Date.now()}`;
                    const rustFile = writeTempFile(code, 'rs');
                    const execPath = path.join(os.tmpdir(), execName);
                    cleanupFiles.push(execPath);
                    await compileAndRun(`rustc ${rustFile} -o ${execPath}`, execPath, []);
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

                    await compileAndRun(`dotnet build ${csharpProjectDir} --nologo`, `dotnet`, ["run", "--project", csharpProjectDir, "--nologo"]);
                    break;
                }
                case "kotlin": {
                    const kotlinJarName = `Main_${Date.now()}.jar`;
                    const kotlinFilePath = writeTempFile(code, 'kt');
                    const jarPath = path.join(os.tmpdir(), kotlinJarName);
                    cleanupFiles.push(jarPath);
                    await compileAndRun(`kotlinc ${kotlinFilePath} -include-runtime -d ${jarPath}`, `java`, ["-jar", jarPath]);
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
                    await compileAndRun(`gcc ${cFile} -o ${execPath}`, execPath, []);
                    break;
                }
                case "fortran": {
                    const execName = `fortran_exec_${Date.now()}`;
                    const fortranFile = writeTempFile(code, 'f90'); // Common Fortran extension
                    const execPath = path.join(os.tmpdir(), execName);
                    cleanupFiles.push(execPath);
                    await compileAndRun(`gfortran ${fortranFile} -o ${execPath}`, execPath, []);
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
                } else {
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
        });
    } finally {
        cleanup();
    }
  }
}