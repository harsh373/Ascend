import api from "./axios";

export const getGlobalLeaderboard = () =>
  api.get("/leaderboard/global");

export const getFriendsLeaderboard = (userId: string) =>
  api.get(`/leaderboard/friends/${userId}`);
