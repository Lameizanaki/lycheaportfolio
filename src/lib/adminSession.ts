const ADMIN_SESSION_HINT_KEY = "lychea-admin-session";

export function hasAdminSessionHint() {
  try {
    return window.sessionStorage.getItem(ADMIN_SESSION_HINT_KEY) === "authenticated";
  } catch {
    return false;
  }
}

export function setAdminSessionHint(authenticated: boolean) {
  try {
    if (authenticated) {
      window.sessionStorage.setItem(ADMIN_SESSION_HINT_KEY, "authenticated");
    } else {
      window.sessionStorage.removeItem(ADMIN_SESSION_HINT_KEY);
    }
  } catch {
    // The server still verifies every protected API request.
  }
}
