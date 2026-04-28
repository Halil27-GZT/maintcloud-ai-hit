const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

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

export { API_BASE_URL };
