import api from "./axios";

export interface PendingFollower {
  userId: string;
  username: string;
  profileImage: string;
  createdAt: string;
}

export const uploadArcCoverPhoto = (formData: FormData) =>
api.post("/arcs/upload-cover", formData, {
headers: { "Content-Type": "multipart/form-data" }
  });

export const createArc = (data: {
userId: string;
title: string;
theme: string;
coverPhoto: string;
isPrivate?: boolean;
}) => api.post("/arcs/create", data);

export const getUserArcs = (userId: string) =>
api.get(`/arcs/user/${userId}`);

export const getArcById = (arcId: string, userId?: string) =>
api.get(`/arcs/${arcId}`, { params: { userId } });

export const getFeed = (userId: string) =>
api.get(`/arcs/feed/${userId}`);

export const addArcUpdate = (
arcId: string,
data: {
type: string;
text: string;
images?: string[];
  }
) => api.post(`/arcs/${arcId}/update`, data);

export const uploadArcUpdateWithImages = (
arcId: string,
formData: FormData
) => api.post(`/arcs/${arcId}/upload-images`, formData, {
headers: { "Content-Type": "multipart/form-data" }
});

export const updateArc = (
arcId: string,
data: {
title?: string;
theme?: string;
coverPhoto?: string;
  }
) => api.put(`/arcs/${arcId}`, data);

export const archiveArc = (arcId: string) =>
api.post(`/arcs/${arcId}/archive`);

export const unarchiveArc = (arcId: string) =>
api.post(`/arcs/${arcId}/unarchive`);

export const toggleArcPrivacy = (arcId: string) =>
api.post(`/arcs/${arcId}/toggle-privacy`);

export const followArc = (arcId: string, userId: string) =>
api.post(`/arcs/${arcId}/follow`, { userId });

export const unfollowArc = (arcId: string, userId: string) =>
api.post(`/arcs/${arcId}/unfollow`, { userId });

export const approveFollower = (arcId: string, userId: string) =>
api.post(`/arcs/${arcId}/approve-follower`, { userId });

export const rejectFollower = (arcId: string, userId: string) =>
api.post(`/arcs/${arcId}/reject-follower`, { userId });

export const getPendingFollowers = (arcId: string) =>
api.get<{ data: PendingFollower[] }>(`/arcs/${arcId}/pending-followers`);

export const getFollowedArcs = (userId: string) =>
api.get(`/arcs/followed/${userId}`);

export const likeUpdate = (arcId: string, updateId: string, userId: string) =>
api.post(`/arcs/${arcId}/updates/${updateId}/like`, { userId });

export const unlikeUpdate = (arcId: string, updateId: string, userId: string) =>
api.post(`/arcs/${arcId}/updates/${updateId}/unlike`, { userId });

export const addComment = (
arcId: string,
updateId: string,
data: {
userId: string;
userName: string;
userAvatar: string;
text: string;
  }
) => api.post(`/arcs/${arcId}/updates/${updateId}/comment`, data);