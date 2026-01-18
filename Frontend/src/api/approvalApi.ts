import api from "./axios";

export const voteOnTask = (data: {
  taskId: string;
  userId: string;
  vote: "approve" | "reject";
}) => api.post("/approval/vote", data);