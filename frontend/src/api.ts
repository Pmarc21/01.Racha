const API_URL = import.meta.env.VITE_API_URL || "";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.reload();
  }
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
