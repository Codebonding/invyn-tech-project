import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";
import { employeesApi } from "./employeesApi";

/**
 * All authentication API state lives here. The signed-in user's safe public profile is the cached
 * result of `getCurrentUser`; login writes it into that cache and logout wipes the whole cache.
 */
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
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      // Only the safe profile is kept. The token travels in an HttpOnly cookie and is never stored here.
      transformResponse: (response) => response.data.user,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          dispatch(
            authApi.util.upsertQueryData("getCurrentUser", undefined, user),
          );
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
        }
      },
    }),

    getCurrentUser: build.query({
      query: () => ({ url: "/auth/me" }),
      transformResponse: (response) => response.data.user,
      providesTags: ["CurrentUser"],
    }),
    setupAccount: build.mutation({
      query: (body) => ({
        url: "/auth/setup-account",
        method: "POST",
        data: body,
      }),
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
  useGetCurrentUserQuery,
  useSetupAccountMutation,
  useDeclineInvitationMutation
} = authApi;
