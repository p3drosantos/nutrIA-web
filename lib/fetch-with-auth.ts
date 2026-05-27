import { API_URL } from "./api";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  localStorage.setItem("token", data.accessToken);

  return data.accessToken;
}

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
) {
  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint}`;

  let token = localStorage.getItem("token");

  let response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // token expirou
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    // refresh falhou
    if (!newAccessToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      window.location.href = "/";

      return new Promise<Response>(() => {});
    }

    // repete request
    response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  return response;
}
