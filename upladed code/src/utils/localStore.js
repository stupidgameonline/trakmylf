import { scheduleCloudPush } from './cloudSync';

export const readLocal = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writeLocal = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
  scheduleCloudPush();
};

export const removeLocal = (key) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
  scheduleCloudPush();
};

export const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
