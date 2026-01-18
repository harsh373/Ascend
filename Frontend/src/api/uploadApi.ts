import api from "./axios";

export const uploadAvatar = (file: File, userId: string) => {
  const form = new FormData();
  form.append("image", file);
  form.append("userId", userId);

  return api.post("/users/upload-avatar", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const uploadTaskProof = (file: File, taskId: string) => {
  const form = new FormData();
  form.append("image", file);
  form.append("taskId", taskId);

  return api.post("/heavy-task/upload-proof", form);
};
