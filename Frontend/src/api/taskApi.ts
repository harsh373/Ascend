import api from "./axios";

export const createTask = (data: any) => api.post("/tasks/create", data);

export const getUserTasks = (userId: string) =>
  api.get(`/tasks/user/${userId}`);

export const completeTask = (taskId: string) =>
  api.post(`/tasks/complete/${taskId}`);
