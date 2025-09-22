import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

export const getUserFromToken = (token: string): DecodedToken | null => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
};


export interface RegisterResponse {
  id: number;
  nom: string;
  email: string;
  role: string;
  message: string;
  token: string;
}

export interface LoginResponse {
  id: number;
  nom: string;
  email: string;
  role: string;
  message: string;
  token: string;
}