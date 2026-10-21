import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { employeesApi } from "../services/employeesApi";
import { dashboardApi } from "../services/dashboardApi";
import { enquiryApi } from "../services/enquiryApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [enquiryApi.reducerPath]: enquiryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, employeesApi.middleware, dashboardApi.middleware, enquiryApi.middleware),
});