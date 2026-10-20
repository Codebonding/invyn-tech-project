import axios from "axios";
import axiosInstance from "./axiosInstance";

/** Every error leaves this module in RTK Query's shape: { status, data: { message, code, errors } }. */
export function normalizeAxiosError(error) {
  if (axios.isCancel(error)) {
    return { status: "CUSTOM_ERROR", data: { message: "The request was cancelled.", code: "CANCELLED", errors: [] } };
  }

  if (error.response) {
    const { status, data } = error.response;
    return {
      status,
      data: {
        message: typeof data?.message === "string" ? data.message : "The request could not be completed.",
        code: data?.code,
        errors: Array.isArray(data?.errors) ? data.errors : [],
      },
    };
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return { status: "TIMEOUT_ERROR", data: { message: "The request timed out. Please try again.", code: "TIMEOUT", errors: [] } };
  }

  if (error.request) {
    return { status: "FETCH_ERROR", data: { message: "Unable to reach the server. Check your connection and try again.", code: "NETWORK_ERROR", errors: [] } };
  }

  return { status: "CUSTOM_ERROR", data: { message: "Something went wrong. Please try again.", code: "UNKNOWN", errors: [] } };
}

/**
 * RTK Query's built-in fetchBaseQuery uses fetch, not Axios. This small baseQuery makes every
 * RTK Query endpoint use the shared Axios instance instead.
 * Endpoint `query` functions return { url, method, data, params }.
 */
const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params }, { signal }) => {
    try {
      const result = await axiosInstance({ url, method, data, params, signal });
      return { data: result.data };
    } catch (error) {
      return { error: normalizeAxiosError(error) };
    }
  };

export default axiosBaseQuery;
