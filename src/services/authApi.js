import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";
import { employeesApi } from "./employeesApi";
import { dashboardApi } from "./dashboardApi";
import { enquiryApi } from "./enquiryApi";
import { enrollmentApi } from "./enrollmentApi";

/** The safe public profile plus the flag that forces a first-login password change. */
const toSession = (response) => ({ ...response.data.user, mustChangePassword: Boolean(response.data.mustChangePassword) });

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["CurrentUser"],
  endpoints: (build) => ({
    registerUser: build.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", data: body }),
      transformResponse: (response) => response.data.user,
    }),

    loginUser: build.mutation({
      query: (credentials) => ({ url: "/auth/login", method: "POST", data: credentials }),
      // Only the safe profile is kept. The token travels in an HttpOnly cookie and is never stored here.
      transformResponse: toSession,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          dispatch(authApi.util.upsertQueryData("getCurrentUser", undefined, user));
        } catch {
          /* the mutation result already carries the error */
        }
      },
    }),

    logoutUser: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(authApi.util.resetApiState());
          dispatch(employeesApi.util.resetApiState());
          dispatch(dashboardApi.util.resetApiState());
          dispatch(enquiryApi.util.resetApiState());
          dispatch(enrollmentApi.util.resetApiState());
        }
      },
    }),

    changePassword: build.mutation({
      query: (body) => ({ url: "/auth/change-password", method: "POST", data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("getCurrentUser", undefined, (draft) => {
              if (draft) draft.mustChangePassword = false;
            })
          );
        } catch {
          /* the mutation result already carries the error */
        }
      },
    }),

    getCurrentUser: build.query({
      query: () => ({ url: "/auth/me" }),
      transformResponse: toSession,
      providesTags: ["CurrentUser"],
    }),

    setupAccount: build.mutation({
      query: (body) => ({ url: "/auth/setup-account", method: "POST", data: body }),
    }),

    declineInvitation: build.mutation({
      query: (body) => ({ url: "/auth/decline-invitation", method: "POST", data: body }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useSetupAccountMutation,
  useDeclineInvitationMutation,
} = authApi;