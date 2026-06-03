import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = async (data: any) => {
  const res = await API.post("/accounts/register/", data);
  return res.data;
};

export const verifyOtp = async (data: { email: string; otp: string }) => {
  const res = await API.post("/accounts/verify-otp/", data);
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await API.post("/accounts/login/", data);
  return res.data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await API.post("/token/refresh/", { refresh });
  localStorage.setItem("access", res.data.access);
  return res.data.access;
};
