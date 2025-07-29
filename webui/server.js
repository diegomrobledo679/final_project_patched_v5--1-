const http = require('http');
const fs = require('fs');
const path = require('path');
const { G4F } = require('g4f');

// Reusable g4f client
const g4f = new G4F();

// SPDX-License-Identifier: Apache-2.0

const publicDir = path.join(__dirname, 'public');

function send404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not found');
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send404(res);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.end(data);
  });
}

// Maintain a persistent working directory for the interpreter API. This
// variable is shared across requests and updated when users change
// directories via "cd". It is initialized to the process working
// directory when the server starts.
let currentDir = process.cwd();

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    // Serve the root page or static assets
    let filePath;
    if (req.url === '/' || req.url === '/index.html') {
      filePath = path.join(publicDir, 'index.html');
    } else {
      filePath = path.join(publicDir, decodeURIComponent(req.url));
    }
    serveFile(filePath, res);
    return;
  }
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Limit body size to 1MB to avoid abuse
      if (body.length > 1e6) {
        req.socket.destroy();
      }
    });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const message = typeof parsed.message === 'string' ? parsed.message : '';
        const model = typeof parsed.model === 'string' ? parsed.model : 'gpt-4.1';
        let text;
        try {
          text = await g4f.chatCompletion([{ role: 'user', content: message }], { model });
        } catch (apiErr) {
          // ignore and fall back
        }
        if (!text) {
          text = `g4f stub response to: ${message}`;
        }
        const responsePayload = { response: text };
        const json = JSON.stringify(responsePayload);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(json);
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/interpreter') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.socket.destroy();
      }
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const cmd = typeof parsed.command === 'string' ? parsed.command : '';
        // Very basic sanitization to prevent destructive commands
        const forbidden = ['rm', 'shutdown', 'reboot', 'sudo'];
        if (forbidden.some((f) => cmd.includes(f))) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Forbidden command' }));
          return;
        }
        const { exec } = require('child_process');
        // If the command is a change directory request, update the
        // persistent cwd and return without executing via exec. Allow
        // commands like "cd" (home) and "cd <dir>". Normalise paths.
        const trimmed = cmd.trim();
        if (trimmed === 'cd' || trimmed.startsWith('cd ')) {
          const parts = trimmed.split(/\s+/);
          // Use HOME as default directory when no argument is provided
          let target = parts[1] || process.env.HOME || process.cwd();
          // Resolve relative paths based on currentDir
          const newDir = path.resolve(currentDir, target);
          // Check that the directory exists and is a directory
          fs.stat(newDir, (err, stats) => {
            if (err || !stats.isDirectory()) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ output: `No existe el directorio: ${target}`, cwd: currentDir }));
            } else {
              currentDir = newDir;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ output: '', cwd: currentDir }));
            }
          });
          return;
        }
        // Execute the command within the persistent working directory.
        exec(cmd, { cwd: currentDir, timeout: 5000 }, (error, stdout, stderr) => {
          let output = '';
          if (error) output += error.message;
          if (stdout) output += stdout;
          if (stderr) output += stderr;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ output, cwd: currentDir }));
        });
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  // Unhandled routes
  send404(res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Web UI listening on port ${PORT}`);
});