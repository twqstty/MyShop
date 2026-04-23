const API_BASE = "http://localhost:3000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function setUserData(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUserData() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUserData() {
  localStorage.removeItem("user");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST", auth: true }),
  getProducts: () => request("/products", { auth: true }),
  getProduct: (id) => request(`/products/${id}`, { auth: true }),
  createProduct: (payload) => request("/products", { method: "POST", body: payload, auth: true }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE", auth: true }),
  createOrder: (payload) => request("/orders", { method: "POST", body: payload, auth: true }),
  getProfile: () => request("/profile/me", { auth: true }),
  updateProfile: (payload) => request("/profile/me", { method: "PUT", body: payload, auth: true }),
  getSupportChat: () => request("/support/chat", { auth: true }),
  getSupportMessages: () => request("/support/chat/messages", { auth: true }),
  sendSupportMessage: (payload) => request("/support/chat/messages", { method: "POST", body: payload, auth: true }),
  getAdminSupportChats: () => request("/support/admin/chats", { auth: true }),
  getAdminSupportMessages: (chatId) => request(`/support/admin/chats/${chatId}/messages`, { auth: true }),
  sendAdminSupportMessage: (chatId, payload) =>
    request(`/support/admin/chats/${chatId}/messages`, { method: "POST", body: payload, auth: true }),
  updateSupportChatStatus: (chatId, payload) =>
    request(`/support/admin/chats/${chatId}`, { method: "PATCH", body: payload, auth: true }),
};
