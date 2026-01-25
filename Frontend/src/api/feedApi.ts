import api from "./axios";

export const getFeed = (userId: string) =>
  api.get(`/feed/${userId}`);