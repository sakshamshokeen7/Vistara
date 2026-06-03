import axios from "./axiosinstances";

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export const getNotifications = async (page: number = 1): Promise<PaginatedNotifications> => {
  const res = await axios.get("/notifications/", {
    params: { page },
  });
  return res.data;
};

export const markNotificationRead = async (id: number) => {
  await axios.post(`/notifications/${id}/read/`);
};
