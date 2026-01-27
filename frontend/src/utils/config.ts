// Get server URL - check URL params, localStorage, environment variable, or derive from host
const getServerUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // On the server (SSR), use the env URL or default
  if (typeof window === "undefined") {
    return envUrl || "http://localhost:8081";
  }

  // Helper: ensure HTTPS when page is served over HTTPS (avoid mixed content)
  const ensureHttps = (url: string): string => {
    if (window.location.protocol === "https:" && url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    return url;
  };

  // Check for clear_backend param to reset cached URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("clear_backend") === "1") {
    localStorage.removeItem("zaggle_backend_url");
    console.log("[config] Cleared cached backend URL");
  }

  // Check for backend URL in query parameter (for easy sharing)
  const backendParam = urlParams.get("backend");
  if (backendParam) {
    const secureUrl = ensureHttps(backendParam);
    localStorage.setItem("zaggle_backend_url", secureUrl);
    console.log("[config] Using backend from URL param:", secureUrl);
    return secureUrl;
  }

  // Check localStorage (persists from previous ?backend= parameter)
  const storedUrl = localStorage.getItem("zaggle_backend_url");
  if (storedUrl) {
    const secureUrl = ensureHttps(storedUrl);
    // Update localStorage if we had to fix the protocol
    if (secureUrl !== storedUrl) {
      localStorage.setItem("zaggle_backend_url", secureUrl);
    }
    console.log("[config] Using backend from localStorage:", secureUrl);
    return secureUrl;
  }

  // On localhost, use the env URL or default
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.log("[config] Using localhost backend:", envUrl || "http://localhost:8081");
    return envUrl || "http://localhost:8081";
  }

  // If env URL is set (e.g., on Vercel), use it
  if (envUrl) {
    const secureUrl = ensureHttps(envUrl);
    console.log("[config] Using backend from env:", secureUrl);
    return secureUrl;
  }

  // Otherwise, use the same host as the frontend but with port 8081
  const derivedUrl = `${window.location.protocol}//${window.location.hostname}:8081`;
  console.log("[config] Using derived backend:", derivedUrl);
  return derivedUrl;
};

const serverUrl = getServerUrl();

export default serverUrl;
