const AUTH_KEY = 'this-life-auth';
const ACCESS_CODE_KEY = 'this-life-access-code';
const FALLBACK_ACCESS_CODE = 'Alpha#12345';
const KEY_PREFIX = 'this-life';
const API_PATH = '/api/state';

let pushTimer = null;

const inBrowser = () => typeof window !== 'undefined';

const isLoggedIn = () => {
  if (!inBrowser()) return false;
  return window.sessionStorage.getItem(AUTH_KEY) === 'true';
};

const getAccessCode = () => {
  if (!inBrowser()) return FALLBACK_ACCESS_CODE;
  return window.sessionStorage.getItem(ACCESS_CODE_KEY) || FALLBACK_ACCESS_CODE;
};

const getHeaders = () => ({
  'content-type': 'application/json',
  'x-access-code': getAccessCode()
});

const isTrackableKey = (key) => typeof key === 'string' && key.startsWith(KEY_PREFIX);

const collectSnapshot = () => {
  if (!inBrowser()) return {};
  const snapshot = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!isTrackableKey(key)) continue;
    snapshot[key] = window.localStorage.getItem(key) || '';
  }
  return snapshot;
};

const applySnapshot = (snapshot) => {
  if (!inBrowser() || !snapshot || typeof snapshot !== 'object') return;

  const existing = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (isTrackableKey(key)) existing.push(key);
  }

  existing.forEach((key) => window.localStorage.removeItem(key));

  Object.entries(snapshot).forEach(([key, value]) => {
    if (!isTrackableKey(key)) return;
    if (typeof value !== 'string') return;
    window.localStorage.setItem(key, value);
  });
};

export async function pullCloudState() {
  if (!inBrowser() || !isLoggedIn()) return false;

  try {
    const response = await fetch(API_PATH, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) return false;

    const payload = await response.json();
    applySnapshot(payload?.state);
    return true;
  } catch {
    return false;
  }
}

export async function pushCloudStateNow() {
  if (!inBrowser() || !isLoggedIn()) return false;

  try {
    const response = await fetch(API_PATH, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        state: collectSnapshot()
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function scheduleCloudPush(delayMs = 700) {
  if (!inBrowser() || !isLoggedIn()) return;
  if (pushTimer) window.clearTimeout(pushTimer);

  pushTimer = window.setTimeout(() => {
    pushCloudStateNow();
    pushTimer = null;
  }, delayMs);
}
