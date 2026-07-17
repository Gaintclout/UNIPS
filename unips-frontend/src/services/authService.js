import api from "./api";
import { saveSession, saveUser } from "./session";

export async function loginUser(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const { access_token: accessToken, user } = response.data;

  if (!accessToken) {
    throw new Error("Login response did not include an access token.");
  }

  saveSession(accessToken, user);
  return { accessToken, user };
}

export async function registerUser({ fullName, email, password, role = "operator" }) {
  const response = await api.post("/auth/register", {
    full_name: fullName,
    email,
    password,
    role,
    is_active: true,
  });

  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get("/auth/me");
  saveUser(response.data);
  return response.data;
}
