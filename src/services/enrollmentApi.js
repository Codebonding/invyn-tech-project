import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

/** The signed-in student's own enrolments. The server decides who may do what; the UI only reflects it. */
export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["MyEnrollments"],
  endpoints: (build) => ({
    listMyEnrollments: build.query({
      query: () => ({ url: "/enrollments/my" }),
      transformResponse: (response) => response.data.enrollments,
      providesTags: ["MyEnrollments"],
    }),

    enrollInCourse: build.mutation({
      // Only the course id is sent. The server takes the student from the login session, never from the request.
      query: (courseId) => ({ url: "/enrollments", method: "POST", data: { courseId } }),
      transformResponse: (response) => response.data.enrollment,
      invalidatesTags: ["MyEnrollments"],
    }),

    cancelMyEnrollment: build.mutation({
      query: (id) => ({ url: `/enrollments/${encodeURIComponent(id)}`, method: "DELETE" }),
      transformResponse: (response) => response.data.enrollment,
      invalidatesTags: ["MyEnrollments"],
    }),
  }),
});

export const { useListMyEnrollmentsQuery, useEnrollInCourseMutation, useCancelMyEnrollmentMutation } = enrollmentApi;