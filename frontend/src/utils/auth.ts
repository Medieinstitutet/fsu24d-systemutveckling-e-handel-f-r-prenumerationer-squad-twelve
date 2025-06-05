import { jwtDecode } from "jwt-decode";
import type { AuthPayload } from "../types/AuthPayload";



export function decodeToken(token: string): AuthPayload {
  return jwtDecode<AuthPayload>(token);
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const { exp } = decodeToken(token);

    if (exp && Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return false;
  }
}

export function getCurrentUser(): AuthPayload | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return decodeToken(token);
  } catch {
    return null;
  }
}
