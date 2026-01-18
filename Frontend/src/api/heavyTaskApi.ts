import api from "./axios";

export const submitHeavyTask = (data: {
  userId: string;
  title: string;
  xp: number;
  proof: string;
  proofType: string;
}) => api.post("/heavy-task/submit", data);


