const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getMachines() {
  return request("/machines");
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
  const response = await fetch(`${API_BASE_URL}/machines/${machineId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
}

export async function getSensorData() {
  const data = await request("/sensor-data");
  return data.items;
}

export async function getMachineSensorData(machineId) {
  const data = await request(`/machines/${machineId}/sensor-data`);
  return data.items;
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
  const response = await fetch(`${API_BASE_URL}/maintenance-records/${recordId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
}

export { API_BASE_URL };
