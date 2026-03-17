import axios from "axios";
import { API_BASE_URL } from "./config";


const api = axios.create(
    {
        baseURL: API_BASE_URL,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    }
);

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call your refresh endpoint
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true // Important if your refresh token is in a Cookie
                });

                const newToken = response.data.token;
                localStorage.setItem('auth_token', newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('auth_token');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);


export default api;