import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  return config;
});
