const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Get trainers from the classes
export async function getClasses() {
  const response = await fetch(`${API_URL}/classes`);

  if (!response.ok) {
    throw new Error("Failed to load classes");
  }

  return response.json();                           
}

// Get trainers from the backend
export async function getTrainers() {
  const response = await fetch(`${API_URL}/trainers`);

  if (!response.ok) {
    throw new Error("Failed to fetch trainers");
  }

  return response.json();
}

// Get membership plans from the backend
export async function getPlans() {
  const response = await fetch(`${API_URL}/plans`);

  if (!response.ok) {
    throw new Error("Failed to fetch membership plans");
  }

  return response.json();
}



async function authRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Authentication request failed");
  }

  return data;
}

export function getCurrentUser() {
  return authRequest("/auth/me");
}

export function registerUser(full_name, email, password) {
  return authRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name, email, password }),
  });
}

export function loginUser(email, password) {
  return authRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutUser() {
  return authRequest("/auth/logout", {
    method: "POST",
  });
}


// Subscribe to a plan
export function subscribeToPlan(plan_id) {
  return authRequest("/memberships/subscribe", {
    method: "POST",
    body: JSON.stringify({ plan_id }),
  });
}

// Get my memberships
export function getMyMemberships() {
  return authRequest("/memberships/my");
}

