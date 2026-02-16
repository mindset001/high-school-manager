import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens } from "../../utils/authTokens";

const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
const API_KEY = import.meta.env.VITE_REACT_APP_API_KEY;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the X-API-Key in all requests
apiClient.interceptors.request.use(
  (config) => {
    config.headers["X-API-Key"] = `${API_KEY}`;
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      // Request a new access token using the refresh token
      const response = await apiClient.post(
        `${process.env.VITE_REACT_APP_API_URL}/refresh`,
        { token: refreshToken }
      );

      const { accessToken } = response.data;
      saveTokens(accessToken);

      // Retry the original request with the new access token
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
