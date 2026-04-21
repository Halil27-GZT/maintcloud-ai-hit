const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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

export async function getSensorData() {
  const data = await request("/sensor-data");
  return data.items;
}

export { API_BASE_URL };
