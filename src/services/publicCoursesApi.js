import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

/** Published courses managed by admins. Public: no login needed. */
export const publicCoursesApi = createApi({
  reducerPath: "publicCoursesApi",
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    listPublicCourses: build.query({
      query: () => ({ url: "/public/courses" }),
      transformResponse: (r) => r.data.courses,
    }),
    getPublicCourse: build.query({
      query: (slug) => ({ url: `/public/courses/${encodeURIComponent(slug)}` }),
      transformResponse: (r) => r.data.course,
    }),
  }),
});

export const { useListPublicCoursesQuery, useGetPublicCourseQuery } = publicCoursesApi;