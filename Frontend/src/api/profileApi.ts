import api from "./axios";


export const getPublicProfile = (userId: string) =>
  api.get(`/profile/${userId}`);


export const togglePrivacy = () =>
  api.patch("/profile/privacy");


export const getUserTasks = (userId: string, page = 1, limit = 20) =>
  api.get(`/profile/${userId}/tasks`, {
    params: { page, limit },
  });

// Get user's challenges (paginated, filterable)
export const getUserChallenges = (
  userId: string, 
  page = 1, 
  limit = 20, 
  filter: "all" | "won" | "lost" = "all"
) =>
  api.get(`/profile/${userId}/challenges`, {
    params: { page, limit, filter },
  });