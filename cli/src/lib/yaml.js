/**
 * Minimal YAML reader/writer — only the subset Excalibur actually uses.
 *
 * Why not a YAML library: the CLI's dependency list is a closed decision
 * (@clack/prompts + mri + picocolors, the same three create-vite uses). Adding a
 * fourth for the handful of files we read would widen the install for very little.
 *
 * Supported: nested maps by indentation, lists of scalars, lists of maps,
 * quoted and bare scalars, booleans/numbers/null, block scalars (| > |- >-),
 * and # comments. Not supported: anchors, aliases, flow collections, multi-doc,
 * complex keys. If a file ever needs one of those, that's the signal to swap
 * this out for the `yaml` package — the change is contained to this file.
 */

function stripComment(line) {
  // A # inside quotes is content, not a comment.
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === "'" && !inDouble) inSingle = !inSingle
    else if (c === '"' && !inSingle) inDouble = !inDouble
    else if (c === '#' && !inSingle && !inDouble) {
      if (i === 0 || /\s/.test(line[i - 1])) return line.slice(0, i)
    }
  }
  return line
}

function parseScalar(raw) {
  const s = raw.trim()
  if (s === '') return ''
  if (s === 'null' || s === '~') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^-?\d+$/.test(s)) return Number(s)
  if (/^-?\d*\.\d+$/.test(s)) return Number(s)
  if (s.length >= 2 && s[0] === '"' && s.endsWith('"')) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n')
  }
  if (s.length >= 2 && s[0] === "'" && s.endsWith("'")) {
    return s.slice(1, -1).replace(/''/g, "'")
  }
  return s
}

/** Tokenize into { indent, content } lines, dropping blanks and comments. */
function tokenize(text) {
  const out = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const indent = raw.length - raw.trimStart().length
    out.push({ indent, raw, content: stripComment(raw).trim(), index: i })
  }
  return out
}

function isBlockScalarHeader(value) {
  return /^[|>][-+]?\d*$/.test(value.trim())
}

/**
 * Read a block scalar body: every following line indented deeper than `baseIndent`.
 * Returns [text, nextIndex].
 */
function readBlockScalar(tokens, start, baseIndent, header) {
  const fold = header.trim().startsWith('>')
  const chomp = header.includes('-') ? 'strip' : header.includes('+') ? 'keep' : 'clip'
  const body = []
  let i = start
  let bodyIndent = null

  while (i < tokens.length) {
    const t = tokens[i]
    const isBlank = t.raw.trim() === ''
    if (isBlank) {
      body.push('')
      i++
      continue
    }
    if (t.indent <= baseIndent) break
    if (bodyIndent === null) bodyIndent = t.indent
    body.push(t.raw.slice(Math.min(bodyIndent, t.indent)))
    i++
  }

  while (body.length && body[body.length - 1] === '') body.pop()

  let text
  if (fold) {
    // Folded: single newlines become spaces, blank lines become real newlines.
    const parts = []
    let current = []
    for (const line of body) {
      if (line === '') {
        parts.push(current.join(' '))
        current = []
      } else {
        current.push(line.trim())
      }
    }
    parts.push(current.join(' '))
    text = parts.join('\n')
  } else {
    text = body.join('\n')
  }

  if (chomp === 'clip') text += '\n'
  else if (chomp === 'keep') text += '\n'

  return [text, i]
}

function splitKey(content) {
  // Find the ":" that ends the key, ignoring quoted sections.
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < content.length; i++) {
    const c = content[i]
    if (c === "'" && !inDouble) inSingle = !inSingle
    else if (c === '"' && !inSingle) inDouble = !inDouble
    else if (c === ':' && !inSingle && !inDouble) {
      const after = content[i + 1]
      if (after === undefined || after === ' ' || after === '\t') {
        return [content.slice(0, i).trim(), content.slice(i + 1).trim()]
      }
    }
  }
  return null
}

function parseBlock(tokens, start, indent) {
  // Decide whether this block is a list or a map by looking at its first real line.
  let i = start
  while (i < tokens.length && tokens[i].content === '') i++
  if (i >= tokens.length) return [null, i]

  if (tokens[i].content.startsWith('- ') || tokens[i].content === '-') {
    return parseList(tokens, i, tokens[i].indent)
  }
  return parseMap(tokens, i, indent)
}

function parseMap(tokens, start, indent) {
  const map = {}
  let i = start

  while (i < tokens.length) {
    const t = tokens[i]
    if (t.content === '') { i++; continue }
    if (t.indent < indent) break
    if (t.indent > indent) {
      // Shouldn't happen for well-formed input; skip rather than throw, so one odd
      // line never takes the whole command down.
      i++
      continue
    }
    if (t.content.startsWith('- ')) break

    const kv = splitKey(t.content)
    if (!kv) { i++; continue }
    const [key, rest] = kv

    if (rest === '') {
      // Value is a nested block (or empty).
      let j = i + 1
      while (j < tokens.length && tokens[j].content === '') j++
      if (j < tokens.length && tokens[j].indent > t.indent) {
        const [value, next] = parseBlock(tokens, j, tokens[j].indent)
        map[key] = value
        i = next
      } else {
        map[key] = null
        i++
      }
    } else if (isBlockScalarHeader(rest)) {
      const [text, next] = readBlockScalar(tokens, i + 1, t.indent, rest)
      map[key] = text.replace(/\n+$/, '')
      i = next
    } else {
      map[key] = parseScalar(rest)
      i++
    }
  }

  return [map, i]
}

function parseList(tokens, start, indent) {
  const list = []
  let i = start

  while (i < tokens.length) {
    const t = tokens[i]
    if (t.content === '') { i++; continue }
    if (t.indent < indent) break
    if (!t.content.startsWith('- ') && t.content !== '-') break

    const inline = t.content === '-' ? '' : t.content.slice(2).trim()

    if (inline === '') {
      // The item's content is on the following lines.
      let j = i + 1
      while (j < tokens.length && tokens[j].content === '') j++
      if (j < tokens.length && tokens[j].indent > t.indent) {
        const [value, next] = parseBlock(tokens, j, tokens[j].indent)
        list.push(value)
        i = next
      } else {
        list.push(null)
        i++
      }
      continue
    }

    const kv = splitKey(inline)
    if (kv) {
      // "- key: value" starts a map whose keys are indented to the inline column.
      const itemIndent = t.indent + 2
      const synthetic = tokens.slice()
      synthetic[i] = { ...t, indent: itemIndent, content: inline, raw: ' '.repeat(itemIndent) + inline }
      const [value, next] = parseMap(synthetic, i, itemIndent)
      list.push(value)
      i = next
    } else if (isBlockScalarHeader(inline)) {
      const [text, next] = readBlockScalar(tokens, i + 1, t.indent, inline)
      list.push(text.replace(/\n+$/, ''))
      i = next
    } else {
      list.push(parseScalar(inline))
      i++
    }
  }

  return [list, i]
}

export function parse(text) {
  const tokens = tokenize(text)
  let i = 0
  while (i < tokens.length && tokens[i].content === '') i++
  if (i >= tokens.length) return {}
  const [value] = parseBlock(tokens, i, tokens[i].indent)
  return value ?? {}
}

function needsQuoting(s) {
  if (s === '') return true
  if (/^[\s]|[\s]$/.test(s)) return true
  if (/^(true|false|null|~)$/i.test(s)) return true
  if (/^-?\d+(\.\d+)?$/.test(s)) return true
  return /[:#\-{}\[\],&*?|<>=!%@`"']/.test(s) && /^[-?:,\[\]{}#&*!|>'"%@`]/.test(s.trim())
}

function formatScalar(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  const s = String(value)
  if (s.includes('\n')) {
    return null // caller handles multi-line as a block scalar
  }
  if (needsQuoting(s) || s.includes(': ') || s.includes(' #')) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return s
}

export function stringify(value, indent = 0) {
  const pad = ' '.repeat(indent)

  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]\n`
    return value
      .map((item) => {
        if (item !== null && typeof item === 'object') {
          const body = stringify(item, indent + 2)
          return `${pad}-${body.slice(indent + 1)}`
        }
        return `${pad}- ${formatScalar(item) ?? ''}\n`
      })
      .join('')
  }

  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return `${pad}{}\n`
    return keys
      .map((key) => {
        const v = value[key]
        if (v !== null && typeof v === 'object') {
          const isEmpty = Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0
          if (isEmpty) return `${pad}${key}: ${Array.isArray(v) ? '[]' : '{}'}\n`
          return `${pad}${key}:\n${stringify(v, indent + 2)}`
        }
        const scalar = formatScalar(v)
        if (scalar === null) {
          const lines = String(v).split('\n').map((l) => `${pad}  ${l}`).join('\n')
          return `${pad}${key}: |-\n${lines}\n`
        }
        return `${pad}${key}: ${scalar}\n`
      })
      .join('')
  }

  return `${pad}${formatScalar(value) ?? ''}\n`
}
