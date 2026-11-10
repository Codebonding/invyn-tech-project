import { dashboardApi } from "./dashboardApi";

const ALL = ["Attendance", "AttendanceRoster", "StudentAttendance"];

export const attendanceApi = dashboardApi
  .enhanceEndpoints({ addTagTypes: ALL })
  .injectEndpoints({
    endpoints: (build) => ({
      // ---- staff ----
      getAttendanceFilters: build.query({
        query: () => ({ url: "/attendance/filters" }),
        transformResponse: (response) => response.data,
        providesTags: ["Attendance"],
      }),
      getCourseSessions: build.query({
        query: (courseId) => ({ url: `/attendance/course/${encodeURIComponent(courseId)}` }),
        transformResponse: (response) => response.data,
        providesTags: ["AttendanceRoster"],
      }),
      getSessionRoster: build.query({
        query: (sessionId) => ({ url: `/attendance/session/${encodeURIComponent(sessionId)}` }),
        transformResponse: (response) => response.data,
        providesTags: ["AttendanceRoster"],
      }),
      // PUT /bulk = create new + correct existing records, atomically on the server.
      saveAttendance: build.mutation({
        query: (body) => ({ url: "/attendance/bulk", method: "PUT", data: body }),
        invalidatesTags: ALL,
      }),
      listAttendance: build.query({
        query: (params) => ({ url: "/attendance", params }),
        transformResponse: (response) => response.data,
        providesTags: ["Attendance"],
      }),
      updateAttendance: build.mutation({
        query: ({ id, ...body }) => ({ url: `/attendance/${encodeURIComponent(id)}`, method: "PATCH", data: body }),
        invalidatesTags: ALL,
      }),
      deleteAttendance: build.mutation({
        query: (id) => ({ url: `/attendance/${encodeURIComponent(id)}`, method: "DELETE" }),
        invalidatesTags: ALL,
      }),
      getAttendanceReport: build.query({
        query: (params) => ({ url: "/attendance/reports", params }),
        transformResponse: (response) => response.data,
        providesTags: ["Attendance"],
      }),

      // ---- student ----
      getStudentAttendanceSummary: build.query({
        query: () => ({ url: "/student/attendance/summary" }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentAttendance"],
      }),
      getStudentAttendance: build.query({
        query: (params) => ({ url: "/student/attendance", params }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentAttendance"],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetAttendanceFiltersQuery,
  useGetCourseSessionsQuery,
  useGetSessionRosterQuery,
  useSaveAttendanceMutation,
  useListAttendanceQuery,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAttendanceReportQuery,
  useGetStudentAttendanceSummaryQuery,
  useGetStudentAttendanceQuery,
} = attendanceApi;