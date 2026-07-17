const TOKEN_KEY = "unips_access_token";
const USER_KEY = "unips_user";
const LAST_ACTIVITY_KEY = "unips_last_activity";
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  if (isSessionExpired()) {
    clearSession();
    return false;
  }

  return true;
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  refreshActivity();
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function refreshActivity() {
  if (getToken()) {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }
}

export function isSessionExpired() {
  const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  if (!lastActivity) return false;

  return Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS;
}
