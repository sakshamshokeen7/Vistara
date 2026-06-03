import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000",   
    prepareHeaders: (headers, { getState }) => {
  const token = (getState() as any).auth?.access;   

  if (token && token !== "undefined" && token !== "null") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
  }),
  tagTypes: ["Auth", "Events", "Photos", "Users"],
  endpoints: () => ({}), 
});

export default api;
