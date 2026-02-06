import axios from 'axios';
import { notifyError } from '../utility/notify';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// global response error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {

        // network issue
        if (!error.response) {
            notifyError("Network error — please check connection.");
            return Promise.reject(error);
        }

        const status = error.response.status;

        // ignore auth pages
        const isAuthRequest =
            url.includes("/auth/login") ||
            url.includes("/auth/register");

        if (status === 401 && !isAuthRequest) {
            notifyError("Session expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "/login";
            return Promise.reject(error);

        } else if (status === 403) {
            notifyError("You don’t have permission for this action.");
        } else if (status === 404) {
            notifyError("Requested resource not found.");
        } else if (status >= 500) {
            notifyError("Server error. Please try later.");
        } else {
            notifyError(error.response.data?.message || "Something went wrong.");
        }

        return Promise.reject(error);
    }
);

export default api;
