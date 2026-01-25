import api from "./axios";

export const searchUsers = (query: string) =>
  api.get(`/friends/search?query=${query}`);

export const sendRequest = (fromId: string, toId: string) =>
  api.post("/friends/request", { fromId, toId });

export const acceptRequest = (userId: string, fromId: string) =>
  api.post("/friends/accept", { userId, fromId });

export const getFriends = (userId: string) =>
  api.get(`/friends/list/${userId}`);


export const getSentRequests = (userId: string) =>
  api.get(`/friends/sent/${userId}`);