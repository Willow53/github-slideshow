/*
 * Static build for Vercel.
 *
 * The canonical site is built by Jekyll on GitHub Pages. Vercel, however,
 * has no Ruby/Jekyll, so this script renders the same reveal.js deck from the
 * Markdown files in _posts/ into a self-contained static site in dist/.
 *
 * Vercel serves dist/ directly (see vercel.json). This does NOT affect the
 * Jekyll build — GitHub Pages ignores dist/, this script, and vercel.json.
 */

const fs = require("fs")
const path = require("path")

const ROOT = __dirname
const POSTS_DIR = path.join(ROOT, "_posts")
const OUT_DIR = path.join(ROOT, "dist")
const REVEAL_SRC = path.join(ROOT, "node_modules", "reveal.js")

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
    return (title ? `# ${title}\n\n` : "") + body
  })
}

function renderDeck() {
  const sections = getSlides()
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
  <title>Slide Deck</title>
  <link rel="stylesheet" href="reveal.js/css/reset.css">
  <link rel="stylesheet" href="reveal.js/css/reveal.css">
  <link rel="stylesheet" href="reveal.js/css/theme/moon.css">
  <link rel="stylesheet" href="reveal.js/lib/css/monokai.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${sections}
    </div>
  </div>
  <script src="reveal.js/js/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      dependencies: [
        { src: 'reveal.js/plugin/markdown/marked.js' },
        { src: 'reveal.js/plugin/markdown/markdown.js' },
        { src: 'reveal.js/plugin/highlight/highlight.js' },
        { src: 'reveal.js/plugin/notes/notes.js', async: true }
      ]
    });
  </script>
</body>
</html>`
}

// Build.
fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.cpSync(REVEAL_SRC, path.join(OUT_DIR, "reveal.js"), { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, "index.html"), renderDeck())

console.log("[v0] Static deck built to dist/")
