type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
};

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

/** Returns null when the browser doesn't support the View Transitions API. */
export function startViewTransition(callback: () => void): ViewTransition | null {
  const doc = document as DocumentWithViewTransitions;
  if (typeof doc.startViewTransition !== "function") return null;
  return doc.startViewTransition(callback);
}
