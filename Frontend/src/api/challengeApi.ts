import api from "./axios";

export const createChallenge = (data: {
  challengerId: string;
  opponentId: string;
  title: string;
  xpReward: number;
  requiresProof: boolean;
  hours: number;
}) => api.post("/challenges/create", data);


export const respondChallenge = (data: {
  challengeId: string;
  accept: boolean;
}) => api.post("/challenges/respond", data);


export const submitChallenge = (data: {
  challengeId: string;
  proof: string;
}) => api.post("/challenges/submit", data);


export const reviewChallenge = (data: {
  challengeId: string;
  approve: boolean;
}) => api.post("/challenges/review", data);


export const getChallenges = (userId: string) =>
  api.get(`/challenges/${userId}`);


export const uploadChallengeProof = (data: FormData) =>
  api.post("/challenges/upload-proof", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });