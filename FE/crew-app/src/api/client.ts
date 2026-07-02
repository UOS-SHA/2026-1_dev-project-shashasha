import axios from "axios";

import { getAuthToken } from "@/store/auth";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 저장된 JWT 토큰이 있으면 모든 요청에 Authorization 헤더를 붙인다.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
