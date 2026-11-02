
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    // Required by the backend's CSRF guard.
    "X-Requested-With": "XMLHttpRequest",
  },
});

export default axiosInstance;
