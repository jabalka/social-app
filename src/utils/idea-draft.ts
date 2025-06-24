import { IdeaDraft } from "@/models/idea";

export const DRAFT_KEY = "IDEA_FORM_DRAFT";

export function saveIdeaDraft(data: IdeaDraft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function loadIdeaDraft(): IdeaDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearIdeaDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
