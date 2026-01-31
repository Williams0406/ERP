// lib/auth.js
import axios from "axios";
import api from "./api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/";

const AUTH_BASE = API_BASE.replace("/api/", "");

export const login = async (username, password) => {
  const res = await axios.post(`${AUTH_BASE}/token/`, {
    username,
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};


export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("access");
  return Boolean(token);
};
