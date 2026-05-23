import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = parseInt(process.env.PORT || "3000", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

http.createServer((req, res) => {
  let url = new URL(req.url, `http://localhost:${PORT}`).pathname;

  if (url === "/" || !url.includes(".")) {
    url = "/index.html";
  }

  const filePath = path.join(DIST, url);

  // Prevent directory traversal
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: if file not found, serve index.html
      if (err.code === "ENOENT") {
        fs.readFile(path.join(DIST, "index.html"), (err2, indexData) => {
          if (err2) {
            res.writeHead(500);
            return res.end("Internal Server Error");
          }
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(indexData);
        });
      } else {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
