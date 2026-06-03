import Api from "./axiosinstances";
const API = Api; 

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
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
          const resp = await API.post("/token/refresh/", { refresh });
          const newAccess = resp.data.access;
          localStorage.setItem("access", newAccess);
          API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          return API(originalRequest);
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

export const uploadMultiplePhotos = async (eventId: number, files: File[]) => {
  const form = new FormData();
  form.append("event_id", String(eventId));
  files.forEach((f) => form.append("files", f));
  const res = await API.post("/photos/upload/multiple/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export default { uploadMultiplePhotos };
