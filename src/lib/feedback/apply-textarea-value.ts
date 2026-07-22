/**
 * Replaces a textarea's value while preserving the browser's native
 * undo/redo (Ctrl+Z) stack. Overwriting `.value` via React state directly
 * is invisible to the browser's edit history, so Ctrl+Z after a toolbar
 * command (or Tab-indent, or an inserted image) would do nothing useful.
 * `execCommand("insertText", ...)` on just the changed span makes the
 * browser treat it as a real edit — and fires a native "input" event, which
 * React's onChange picks up on its own, so callers should NOT also call
 * onChange when this returns true.
 */
export function applyTextareaValue(
  textarea: HTMLTextAreaElement,
  newValue: string,
  selectionStart: number,
  selectionEnd: number
): boolean {
  const oldValue = textarea.value;

  let prefix = 0;
  const maxPrefix = Math.min(oldValue.length, newValue.length);
  while (prefix < maxPrefix && oldValue[prefix] === newValue[prefix]) prefix++;

  let oldEnd = oldValue.length;
  let newEnd = newValue.length;
  while (oldEnd > prefix && newEnd > prefix && oldValue[oldEnd - 1] === newValue[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }

  const replacement = newValue.slice(prefix, newEnd);
  textarea.focus();
  textarea.setSelectionRange(prefix, oldEnd);

  const applied = document.execCommand("insertText", false, replacement);
  if (applied) {
    requestAnimationFrame(() => textarea.setSelectionRange(selectionStart, selectionEnd));
  }
  return applied;
}
