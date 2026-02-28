const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchStudents() {
  const res = await fetch(`${API_URL}/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchCredentials() {
  const res = await fetch(`${API_URL}/credentials`);
  if (!res.ok) throw new Error('Failed to fetch credentials');
  return res.json();
}

export async function fetchCredentialByCode(code: string) {
  const res = await fetch(`${API_URL}/credentials/verify/${code}`);
  if (!res.ok) throw new Error('Failed to fetch credential');
  return res.json();
}

export async function createStudent(data: any) {
  const res = await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create student');
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}
