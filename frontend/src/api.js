export const BASE_URL =
  import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8008';

export async function health() {
  const r = await fetch(`${BASE_URL}/health`);
  if (!r.ok) throw new Error('Health check failed');
  return r.json();
}

export async function advise(payload) {
  const res = await fetch(`${BASE_URL}/advise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
