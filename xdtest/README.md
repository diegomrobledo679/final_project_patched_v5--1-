# Open Interpreter (Unofficial JS/TS Port)

This is an unofficial port of the Open Interpreter to the JavaScript/TypeScript ecosystem, aiming to provide a robust and extensible environment for AI-driven code execution and interaction.

## Features:

This CLI agent now supports a wide range of functionalities, including:

*   **Multi-Language Code Execution:** Seamlessly execute code in various programming languages, including:
    *   Python
    *   JavaScript (Node.js)
    *   Shell (Bash/Zsh)
    *   Ruby
    *   Perl
    *   PHP
    *   PowerShell
    *   Java
    *   Go
    *   C++
    *   Rust
    *   Swift
    *   C#
    *   Kotlin
    *   R
    *   TypeScript
    *   Groovy
    *   Scala

*   **Intelligent Environment Setup:** Automatically checks for and installs necessary language runtimes and package managers (e.g., `python`, `node`, `npm`, `brew`, `apt`, `yum`, `choco`, `rustup`) across different operating systems (Linux, macOS, Windows).

*   **Code Analysis Tools:**
    *   **Syntax Checking:** Utilizes language-specific tools to perform syntax checks on provided code, reporting errors and warnings.
    *   **Automatic Error Fixing and Formatting:** Uses Prettier for JavaScript/TypeScript and leverages `autopep8` or `black` when available for Python to fix and format code snippets.

*   **Configurable Options:** Many aspects of the interpreter's behavior can be configured via command-line arguments, including:
    *   `--autoRun`: Automatically execute code blocks without user confirmation.
    *   `--loop`: Continuously run the interpreter in a loop until a breaking condition is met.
    *   `--safeMode`: Control the level of file system access during code execution.
    *   `--shrinkImages`: Automatically resize images for vision processing.
    *   `--disableTelemetry`: Disable telemetry data contribution.
    *   `--inTerminalInterface`: Optimize output for terminal display.
    *   `--speakMessage`: Enable text-to-speech for output messages.
    *   `--alwaysApplyMessageTemplate`: Always apply a predefined message template to LLM responses.
    *   `--multiLine`: Enable multi-line input.
    *   `--contributeConversation`: Allow conversation data to be contributed for telemetry.
    *   `--plainTextDisplay`: Force plain text output.
    *   `--highlightActiveLine`: Highlight the active line in code blocks.
    *   `--autoFixCode`: Enable automatic code fixing attempts.
    *   `--displayMode`: Set the display mode ('cli' or 'gui').
    *   `--conversationHistory`: Enable or disable conversation history.
    *   `--conversationFilename`: Specify the conversation history filename.

*   **Extensible Tooling:** Easily integrate new tools and functionalities.
*   **File Utilities:** Built-in helpers for reading, writing, and recursively searching files.
*   **Advanced File Analysis:** Tools like `deepSearch` (with optional depth limits), directory structure listing, and detection of file content types.
*   **System Management Tools:** Retrieve hardware details and manage network interfaces across platforms.
*   **Image Generation Tool:** Use the `generateImage` tool to create images from text prompts. When `OPENAI_API_KEY` is configured, the tool generates real images using OpenAI; otherwise it falls back to a placeholder image.
*   **Web Research Tool:** The `webResearch` tool performs a search and summarizes the top results for quick reference.
*   **Virtual Terminal Tool:** The `launchVirtualTerminal` tool uses `node-pty` to provide an interactive shell session when available and falls back to a regular shell spawn if pseudo-terminals are unsupported.
*   **Spotify Playback Tool:** The `playSpotify` tool opens a Spotify track or playlist in your default player using a provided URI or URL.
*   **Email Sending Tool:** The `sendEmail` tool dispatches a plain-text email using SMTP credentials defined in environment variables.
*   **Conceptual GUI Integration:** Includes conceptual methods for display updates and input event handling, laying the groundwork for future graphical user interface implementations.

## Installation and Usage:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the TypeScript source:

   ```bash
   npm run build
   ```

3. Run the automated test suite:

   ```bash
   npm test
   ```

4. Start the interpreter:

   ```bash
   node dist/index.js
   ```

After installation you can launch **Cyrah** directly from the terminal:

```bash
npx cyrah
```

To start the CLI, web interface, and GUI all at once run:

```bash
npx cyrah-auto
```

You can also launch a simple web interface:
```bash
npm run start-web
```
Then open http://localhost:3000 in your browser to chat. The interactive menu
includes options to start just the web server or start it alongside the CLI.
You can also launch both together with the `--web` flag or choose "Start CLI and
Web Interface" from the menu. Use the new `--port` option to specify the web
server port (defaults to `3000`). A "Start All" menu option starts the CLI, web
interface, and GUI in one step. Additional flags let you control conversation
history: `--history-path` sets the log directory, `--conversation-file` chooses
the filename, and `--conversation-max` limits how many messages are retained.

Running `npx cyrah` with no arguments now opens an interactive menu by default.
Pass `--no-menu` (or set the `NO_MENU=true` environment variable) to jump
straight into the CLI. Use `--web` to start the web interface alongside the CLI
or choose "Start CLI and Web Interface" from the menu. The `--gui` flag opens
the graphical interface on startup and `--auto` (or the new `cyrah-auto`
command) launches the CLI, web interface, and GUI all at once. These flags can
also be enabled through environment variables: set `START_WEB=true`,
`START_GUI=true`, or `AUTO_START=true` to replicate the respective
command-line options.
Use `--version` to print the installed package version. Set
`PRINT_VERSION=true` to automatically show the version on startup.

The menu includes a **Play Spotify Track/Playlist** option that opens any
provided URI using the new `playSpotify` tool. You can also trigger playback
directly with the `--spotify` flag or by setting `SPOTIFY_URI` in the
environment.
There's also an **Open URL in Browser** option that launches any URL in your
default browser via the `openUrl` tool. Trigger it with the `--open-url` flag or
by setting `OPEN_URL`.
There's also an **Open File or Folder** option that opens a specified path using
the new `openPath` tool. The command validates that the path exists before
attempting to launch it. Trigger this tool with the `--open-path` flag or by
setting `OPEN_PATH`.
There's also a **Send Email** menu option which uses the `sendEmail` tool. You
may provide the recipient, subject, and message interactively or trigger it
directly with the `--send-email` flag. The `EMAIL_TO`, `EMAIL_SUBJECT`, and
`EMAIL_TEXT` variables can automate the process.
There's also a **Check System Health** option that runs basic diagnostics via
the `checkSystemHealth` tool. Trigger it with the `--check-health` flag or by
setting `CHECK_HEALTH=true`.
There's also a **Load Environment File** option to import variables from a
`.env` file on demand.
There's also **List Available Tools** to print all registered tool names with
descriptions.
There's also **List Supported Languages** to see which programming languages the interpreter can execute.
There's also **List Environment Variables** to display relevant configuration values using the `listEnvironmentVariables` tool.

You can list all available tools with `--list-tools` or by setting `LIST_TOOLS=true`.
You can list supported languages with `--list-languages` or `LIST_LANGUAGES=true`.
You can list relevant environment variables with `--list-env` or `LIST_ENV=true`.
You can pass interpreter options directly on the command line or via
environment variables. Use `--env KEY=VALUE` to set a variable for
the current run, or choose **Set Environment Variables** in the interactive
menu to review, update, or unset variables. You can also load many variables at once with
`--env-file path/to/.env`. A `--help` flag shows the available options.

## Configuration via Environment Variables

The interpreter reads various settings from environment variables if corresponding CLI options are omitted. Useful variables include:

- `LLM_PROVIDER` – Provider name like `openai`, `ollama`, or `g4f.dev`.
- If unset, `g4f.dev` is used automatically as the provider.
- `LLM_MODEL` – Model identifier to use.
- `LLM_API_KEY` – API key for the provider.
- `LLM_BASE_URL` – Base URL for API requests.
- `OPENAI_BASE_URL` – Override the default OpenAI API URL when using the `openai` provider.
- `OLLAMA_BASE_URL` – Override the default Ollama API URL when using the `ollama` provider.
- `OPENAI_API_KEY` – API key specifically for OpenAI.
- `OLLAMA_API_KEY` – API key specifically for Ollama if required.
- When using the `ollama` provider an API key is not required. If none is
  supplied a dummy value is used so the client library can operate against a
  local Ollama instance.
- When using the `g4f.dev` provider an API key is not required as the library works
  without credentials.
- `LLM_TEMPERATURE` – Sampling temperature for responses.
- `LLM_MAX_TOKENS` – Maximum tokens to request from the model.
- `AUTO_RUN` – Set to `true` or `false` to control automatic execution of code blocks.
- `LOOP` – Set to `true` to keep the interpreter running in a loop.
- `OFFLINE` – Set to `true` to disable network access by default.
- `VERBOSE` – Set to `true` for verbose logging output.
- `DEBUG` – Set to `true` to enable debug logging.
- `SAFE_MODE` – Specify the default safe mode level.
- `MAX_OUTPUT` – Maximum number of characters to display from tool or code output.
- `CONVERSATION_HISTORY_PATH` – Directory where conversation logs are stored.
- `CONVERSATION_FILENAME` – Name of the JSON file used to save conversations.
- `CONVERSATION_MAX_LENGTH` – Maximum number of messages to keep in memory and
  in saved conversation history.
- `SKILLS_PATH` – Directory containing custom skill modules.
- `IMPORT_SKILLS` – Set to `true` to automatically load skills on startup.
- `UI_BASE_URL` – Base URL used by the `launchUI` tool if no URL is provided.
- `UI_NAME` – Name of the UI to launch when running the `cyrah` command or when
  `DISPLAY_MODE` is set to `gui`.
- `DISPLAY_MODE` – Set to `gui` to automatically open the UI when the interpreter starts.
- `NO_MENU` – Set to `true` to skip the interactive menu when no arguments are provided.
- `START_WEB` – Set to `true` to automatically launch the web interface.
- `START_GUI` – Set to `true` to automatically open the graphical interface.
- `AUTO_START` – Set to `true` to start the CLI, web interface, and GUI together.
- `PORT` – Port used by the web interface when starting with `--web` or `START_WEB`.
- `SPOTIFY_URI` – If set, automatically play this Spotify URI on startup or when using the menu option.
- `OPEN_URL` – If set, automatically open this URL in the default browser on startup.
- `OPEN_PATH` – If set, automatically open this file or folder on startup.
- `EMAIL_HOST` – SMTP server host used by the `sendEmail` tool.
- `EMAIL_PORT` – SMTP server port (defaults to 587 if not set).
- `EMAIL_SECURE` – Set to `true` to use TLS/SSL for SMTP.
- `EMAIL_USER` – SMTP username for authentication.
- `EMAIL_PASS` – SMTP password for authentication.
- `EMAIL_FROM` – Optional sender address for outgoing mail.
- `EMAIL_TO` – Recipient address used when auto-sending email.
- `EMAIL_SUBJECT` – Subject used when auto-sending email.
- `EMAIL_TEXT` – Message body used when auto-sending email.
- `CHECK_HEALTH` – Set to `true` to run system health checks on startup.
These variables (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) must be set for the email tool to work.
- `LIST_TOOLS` – Set to `true` to print all available tools on startup.
- `LIST_LANGUAGES` – Set to `true` to print supported languages on startup.
- `LIST_ENV` – Set to `true` to print all relevant environment variables on startup.
- `ENV_FILE` – Path to a `.env` file loaded on startup or with `--env-file`.
- `PRINT_VERSION` – Set to `true` to print the package version on startup.

Create a `.env` file with these values to avoid passing them as flags. You can
also provide temporary overrides on the command line using `--env KEY=VALUE`.
