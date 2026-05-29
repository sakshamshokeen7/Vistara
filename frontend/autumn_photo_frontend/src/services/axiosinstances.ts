import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (
  token &&
  !config.url?.includes("/auth/login") &&
  !config.url?.includes("/auth/register")
) {
  config.headers.Authorization = `Bearer ${token}`;
}
  
  // Don't set Content-Type for FormData - let browser handle it
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const resp = await axiosInstance.post("/token/refresh/", { refresh });
          const newAccess = resp.data.access;
          localStorage.setItem("access", newAccess);
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        } catch (e) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
