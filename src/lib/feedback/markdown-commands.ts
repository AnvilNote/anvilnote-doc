export interface EditorSelection {
  value: string;
  start: number;
  end: number;
}

export interface EditorCommand {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Wraps the selection in a marker pair (e.g. **bold**, *italic*, ~~strike~~). */
export function wrapInline(sel: EditorSelection, marker: string, placeholder: string): EditorCommand {
  const hasSelection = sel.end > sel.start;
  const text = hasSelection ? sel.value.slice(sel.start, sel.end) : placeholder;
  const before = sel.value.slice(0, sel.start);
  const after = sel.value.slice(sel.end);
  const value = `${before}${marker}${text}${marker}${after}`;
  const selectionStart = sel.start + marker.length;
  const selectionEnd = selectionStart + text.length;
  return { value, selectionStart, selectionEnd };
}

/** Prefixes every line touched by the selection (headings, list items). */
export function prefixLines(sel: EditorSelection, prefix: string): EditorCommand {
  const lineStart = sel.value.lastIndexOf("\n", sel.start - 1) + 1;
  const nextBreak = sel.value.indexOf("\n", sel.end);
  const lineEnd = nextBreak === -1 ? sel.value.length : nextBreak;

  const before = sel.value.slice(0, lineStart);
  const affected = sel.value.slice(lineStart, lineEnd);
  const after = sel.value.slice(lineEnd);

  const prefixed = affected
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");

  const value = `${before}${prefixed}${after}`;
  return {
    value,
    selectionStart: sel.start + prefix.length,
    selectionEnd: sel.end + prefix.length * prefixed.split("\n").length,
  };
}

const LIST_MARKER = /^(\s*)([-*+]\s+|\d+[.)]\s+)/;
const CONTINUATION_INDENT = /^(\s+)\S/;

/** Indentation needed for a new block to nest inside the list item on this line, if any. */
function listContinuationIndent(line: string): string {
  const markerMatch = line.match(LIST_MARKER);
  if (markerMatch) return markerMatch[1] + " ".repeat(markerMatch[2].length);
  const indentMatch = line.match(CONTINUATION_INDENT);
  return indentMatch ? indentMatch[1] : "";
}

/** Inserts an image, indenting it to nest under the current line's list item, if any. */
export function insertImage(sel: EditorSelection, url: string, alt: string): EditorCommand {
  const lineStart = sel.value.lastIndexOf("\n", sel.start - 1) + 1;
  const nextBreak = sel.value.indexOf("\n", sel.start);
  const lineEnd = nextBreak === -1 ? sel.value.length : nextBreak;
  const currentLine = sel.value.slice(lineStart, lineEnd);
  const indent = listContinuationIndent(currentLine);

  const before = sel.value.slice(0, sel.start);
  const after = sel.value.slice(sel.end);
  const markdown = `![${alt}](${url})`;
  const insertion = indent ? `\n\n${indent}${markdown}\n` : `\n${markdown}\n`;

  const value = `${before}${insertion}${after}`;
  const selectionStart = before.length + insertion.length;
  return { value, selectionStart, selectionEnd: selectionStart };
}

/** Inserts a markdown link, using the selection as link text if there is one. */
export function insertLink(sel: EditorSelection, urlPlaceholder: string): EditorCommand {
  const hasSelection = sel.end > sel.start;
  const before = sel.value.slice(0, sel.start);
  const after = sel.value.slice(sel.end);

  if (hasSelection) {
    const text = sel.value.slice(sel.start, sel.end);
    const value = `${before}[${text}](${urlPlaceholder})${after}`;
    const selectionStart = sel.start + text.length + 3; // "[text](".length - 1 for the "("
    const selectionEnd = selectionStart + urlPlaceholder.length;
    return { value, selectionStart, selectionEnd };
  }

  const textPlaceholder = "link text";
  const value = `${before}[${textPlaceholder}](${urlPlaceholder})${after}`;
  const selectionStart = sel.start + 1;
  const selectionEnd = selectionStart + textPlaceholder.length;
  return { value, selectionStart, selectionEnd };
}
