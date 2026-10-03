import { renderToString } from "katex";

const command = /\\(?:[a-zA-Z]+)(?![a-zA-Z])/;
const delimiters = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false },
  { left: "$", right: "$", display: false },
];

/** Repair copied, double-escaped commands, never globally replace TeX row breaks.
 * Environment bodies are intentionally preserved: \\ followed by a command can
 * mean a row break followed by a variable, not a serialization error.
 * JSON escaping is handled by the transport, not by JSON.parse on field values.
 */
export function normalizeMathText(text: string): string {
  return text.replace(
    /\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}|\\{2,}(?=[a-zA-Z]+|[()[\]])/g,
    (match) => match.startsWith("\\begin{") ? match : "\\",
  );
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}

function mathHtml(text: string, display: boolean): string {
  try {
    return renderToString(text, {
      displayMode: display, throwOnError: false, trust: false,
      strict: "ignore", maxExpand: 1000, maxSize: 20,
    });
  } catch {
    // An unfinished expression in live preview must not break the editor.
    return escapeHtml(text);
  }
}

// Read balanced arguments, including spaces/prose in \text{...} and nested frac.
function groupEnd(text: string, start: number): number {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "\\") { i++; continue; }
    if (text[i] === "{") depth++;
    if (text[i] === "}" && --depth === 0) return i + 1;
  }
  return text.length;
}

/** Recognize runs of math tokens, keeping surrounding prose as ordinary text.
 * Only runs containing a TeX command are inferred; plain prices/numbers aren't.
 * Explicit delimiters remain the unambiguous choice for arbitrary prose/math.
 */
function bareHtml(text: string): string {
  let result = "", run = "";
  const flush = () => {
    const expression = run.trim();
    if (command.test(expression)) {
      result += escapeHtml(run.slice(0, run.indexOf(expression)))
        + mathHtml(expression, false)
        + escapeHtml(run.slice(run.indexOf(expression) + expression.length));
    } else result += escapeHtml(run);
    run = "";
  };
  for (let i = 0; i < text.length;) {
    const rest = text.slice(i);
    const environment = /^\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}/.exec(rest);
    if (environment) {
      flush(); result += mathHtml(environment[0], true); i += environment[0].length;
      continue;
    }
    if (text[i] === "{") {
      const end = groupEnd(text, i);
      run += text.slice(i, end); i = end; continue;
    }
    const token = /^(?:\\[a-zA-Z]+|\\[^a-zA-Z]|[\p{L}\p{M}]+|\d+(?:\.\d+)?|[^\S\r\n]+|[+\-*/=<>^_()[\]|.,:;!&])/u.exec(rest)?.[0];
    if (token && (!/^[\p{L}\p{M}]/u.test(token) || /^[a-zA-Z]$/.test(token))) {
      run += token; i += token.length;
    } else {
      flush();
      const plain = token ?? text[i];
      result += escapeHtml(plain); i += plain.length;
    }
  }
  flush();
  return result;
}

function closingIndex(text: string, start: number, right: string): number {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (depth === 0 && text.startsWith(right, i)) return i;
    if (text[i] === "\\") { i++; continue; }
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth = Math.max(0, depth - 1);
  }
  return -1;
}

/** Only escaped plain text and untrusted-mode KaTeX output may enter this HTML. */
export function renderMathText(input: string): string {
  const text = normalizeMathText(input);
  let result = "", plainStart = 0;
  for (let i = 0; i < text.length;) {
    const delimiter = delimiters.find(({ left }) => text.startsWith(left, i));
    if (delimiter) {
      const start = i + delimiter.left.length;
      const end = closingIndex(text, start, delimiter.right);
      if (end !== -1) {
        result += bareHtml(text.slice(plainStart, i));
        result += mathHtml(text.slice(start, end), delimiter.display);
        i = end + delimiter.right.length; plainStart = i;
        continue;
      }
      // Preserve incomplete delimiters while the teacher is typing.
      i += delimiter.left.length;
    } else i += text[i] === "\\" ? 2 : 1;
  }
  return result + bareHtml(text.slice(plainStart));
}
