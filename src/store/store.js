import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { employeesApi } from "../services/employeesApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, employeesApi.middleware),
});