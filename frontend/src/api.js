const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";
const ACCESS_TOKEN_STORAGE_KEY = "maintcloud.access_token";

function normalizeApiBaseUrl(value) {
  if (!value) {
    return "/api";
  }

  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/+$/, "");
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return normalizedPath.replace(/\/+$/, "");
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function parseError(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string" && payload.detail) {
        return payload.detail;
      }
      if (typeof payload?.message === "string" && payload.message) {
        return payload.message;
      }
    } catch {
      return "";
    }
  }

  try {
    const text = await response.text();
    return text.trim();
  } catch {
    return "";
  }
}

async function request(path, options = {}) {
  const { headers, ...requestOptions } = options;
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
      : null;

  let response;
  try {
    response = await fetch(buildApiUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      ...requestOptions,
    });
  } catch {
    throw new Error(
      `API unter ${API_BASE_URL} ist nicht erreichbar. Pruefe die API-URL und ob Backend bzw. Proxy laufen.`,
    );
  }

  if (!response.ok) {
    const errorMessage = await parseError(response);
    const error = new Error(
      errorMessage || `API request to ${buildApiUrl(path)} failed with status ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

export async function getMachines() {
  return request("/machines");
}

export async function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

export async function getUsers() {
  const data = await request("/users");
  return data.items;
}

export async function createUser(payload) {
  return request("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(userId, payload) {
  return request(`/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateUserStatus(userId, payload) {
  return request(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getMachine(machineId) {
  return request(`/machines/${machineId}`);
}

export async function createMachine(payload) {
  return request("/machines", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMachine(machineId, payload) {
  return request(`/machines/${machineId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMachine(machineId) {
  await request(`/machines/${machineId}`, {
    method: "DELETE",
  });
}

export async function getSensorData() {
  const data = await request("/sensor-data");
  return data.items;
}

export async function getMachineSensorData(machineId) {
  const data = await request(`/machines/${machineId}/sensor-data`);
  return data.items;
}

export async function createSensorData(payload) {
  const data = await request("/sensor-data", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function getMachineMaintenanceRecords(machineId) {
  const data = await request(`/machines/${machineId}/maintenance-records`);
  return data.items;
}

export async function createMaintenanceRecord(payload) {
  return request("/maintenance-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMaintenanceRecord(recordId, payload) {
  return request(`/maintenance-records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMaintenanceRecord(recordId) {
  await request(`/maintenance-records/${recordId}`, {
    method: "DELETE",
  });
}

export async function getHealthStatus() {
  return request("/health");
}

export async function getReadinessStatus() {
  return request("/health/ready");
}

export { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL };
