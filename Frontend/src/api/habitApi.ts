import api from "./axios";

export const createHabits = (userId: string, habits: string[]) =>
  api.post("/habits/create", { userId, habits });

export const getHabits = (userId: string) =>
  api.get(`/habits/${userId}`);

export const completeHabit = (habitId: string) =>
  api.post(`/habits/complete/${habitId}`);

export const addHabit = (userId: string, title: string) =>
  api.post("/habits/add", { userId, title });

export const updateHabit = (habitId: string, title: string) =>
  api.put(`/habits/${habitId}`, { title });

export const deleteHabit = (habitId: string) =>
  api.delete(`/habits/${habitId}`);