import api from "./axios";

export const uploadArcCoverPhoto = (formData: FormData) =>
  api.post("/arcs/upload-cover", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const createArc = (data: {
  userId: string;
  title: string;
  theme: string;
  coverPhoto: string;
}) => api.post("/arcs/create", data);

export const getUserArcs = (userId: string) =>
  api.get(`/arcs/user/${userId}`);

export const getArcById = (arcId: string) =>
  api.get(`/arcs/${arcId}`);

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

export const followArc = (arcId: string, userId: string) =>
  api.post(`/arcs/${arcId}/follow`, { userId });

export const unfollowArc = (arcId: string, userId: string) =>
  api.post(`/arcs/${arcId}/unfollow`, { userId });

export const getFollowedArcs = (userId: string) =>
  api.get(`/arcs/followed/${userId}`);