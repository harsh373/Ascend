import axios from "axios";


declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});


api.interceptors.request.use(
  async (config) => {
    try {
     
      const token = await window.Clerk?.session?.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

console.log("API BASE URL:", import.meta.env.VITE_API_URL);

export default api;