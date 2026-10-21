import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Courses"],
  endpoints: (build) => ({
    listStudents: build.query({
      query: () => ({ url: "/users", params: { role: "student", limit: 100 } }),
      transformResponse: (r) => r.data,
    }),
    listEnrollments: build.query({
      query: () => ({ url: "/enrollments", params: { limit: 100 } }),
      transformResponse: (r) => r.data,
      providesTags: ["Courses"],
    }),
    listCourses: build.query({
      query: () => ({ url: "/courses", params: { limit: 100 } }),
      transformResponse: (r) => r.data,
      providesTags: ["Courses"],
    }),
    createCourse: build.mutation({
      query: (body) => ({ url: "/courses", method: "POST", data: body }),
      invalidatesTags: ["Courses"],
    }),
    updateCourse: build.mutation({
      query: ({ id, ...body }) => ({ url: `/courses/${id}`, method: "PATCH", data: body }),
      invalidatesTags: ["Courses"],
    }),
  }),
});

export const {
  useListStudentsQuery,
  useListEnrollmentsQuery,
  useListCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
} = dashboardApi;