import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const getPublicArc = (arcId: string) =>
  publicApi.get(`/arcs/public/${arcId}`);

