import api from "./axios";

export const createHabits = (userId: string, habits: string[]) =>
  api.post("/habits/create", { userId, habits });

export const getHabits = (userId: string) =>
  api.get(`/habits/${userId}`);

export const completeHabit = (habitId: string) =>
  api.post(`/habits/complete/${habitId}`);
