export function saveDraft<T>(DRAFT_KEY: string, data: T) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function loadDraft<T>(DRAFT_KEY: string): T | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(DRAFT_KEY: string) {
  localStorage.removeItem(DRAFT_KEY);
}