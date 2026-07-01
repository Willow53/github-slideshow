/*
 * Lightweight, dependency-free preview server for the v0 sandbox.
 *
 * The real site is built by Jekyll on GitHub Pages. The v0 preview sandbox
 * only has Node (no Ruby/Jekyll), so this server renders the same reveal.js
 * deck directly from the Markdown files in _posts/ so you can preview slides.
 *
 * It does NOT affect the Jekyll build. GitHub Pages ignores this file.
 */

const http = require("http")
const fs = require("fs")
const path = require("path")

const ROOT = __dirname
const POSTS_DIR = path.join(ROOT, "_posts")
const PORT = process.env.PORT || 3000

const MIME = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json",
}

// Parse front matter and return { title, body }.
function parsePost(raw) {
  let title = ""
  let body = raw
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (match) {
    const front = match[1]
    body = match[2]
    const titleLine = front.match(/^\s*title:\s*(.*)\s*$/m)
    if (titleLine) {
      title = titleLine[1].trim().replace(/^["']|["']$/g, "")
    }
  }
  return { title, body: body.trim() }
}

function getSlides() {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".markdown"))
    .sort()

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8")
    const { title, body } = parsePost(raw)
    // Mirror the Jekyll slide include: an <h1> title followed by the body.
    const markdown = (title ? `# ${title}\n\n` : "") + body
    return markdown
  })
}

function renderDeck() {
  const slides = getSlides()
  const sections = slides
    .map(
      (md) =>
        `<section data-markdown><textarea data-template>\n${md}\n</textarea></section>`,
    )
    .join("\n")

  return `<!DOCTYPE html>
<html class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Slide Deck Preview</title>
  <link rel="stylesheet" href="/node_modules/reveal.js/css/reset.css">
  <link rel="stylesheet" href="/node_modules/reveal.js/css/reveal.css">
  <link rel="stylesheet" href="/node_modules/reveal.js/css/theme/moon.css">
  <link rel="stylesheet" href="/node_modules/reveal.js/lib/css/monokai.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${sections}
    </div>
  </div>
  <script src="/node_modules/reveal.js/js/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      dependencies: [
        { src: '/node_modules/reveal.js/plugin/markdown/marked.js' },
        { src: '/node_modules/reveal.js/plugin/markdown/markdown.js' },
        { src: '/node_modules/reveal.js/plugin/highlight/highlight.js' },
        { src: '/node_modules/reveal.js/plugin/notes/notes.js', async: true }
      ]
    });
  </script>
</body>
</html>`
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0])
  const filePath = path.join(ROOT, urlPath)

  // Prevent path traversal outside the project root.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403)
    res.end("Forbidden")
    return
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end("Not found")
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0]
  if (urlPath === "/" || urlPath === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(renderDeck())
    return
  }
  serveStatic(req, res)
})

server.listen(PORT, () => {
  console.log("[v0] Preview server running on port " + PORT)
})
