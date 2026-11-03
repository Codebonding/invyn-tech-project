import { dashboardApi } from "./dashboardApi";

/**
 * Student dashboard endpoints. They extend the existing dashboardApi (same base query, cookies and store entry),
 * so no new reducer or middleware is needed and logout already clears this cache.
 */
export const studentApi = dashboardApi
  .enhanceEndpoints({ addTagTypes: ["StudentDashboard", "StudentNotifications"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getStudentDashboard: build.query({
        query: () => ({ url: "/student/dashboard" }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentDashboard"],
      }),

      listStudentNotifications: build.query({
        query: (params) => ({ url: "/student/notifications", params }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentNotifications"],
      }),

      markNotificationRead: build.mutation({
        query: (id) => ({ url: `/student/notifications/${encodeURIComponent(id)}/read`, method: "PATCH" }),
        invalidatesTags: ["StudentDashboard", "StudentNotifications"],
      }),

      completeLesson: build.mutation({
        query: ({ courseId, moduleIndex, lessonIndex }) => ({
          url: `/student/courses/${encodeURIComponent(courseId)}/lessons/complete`,
          method: "POST",
          data: { moduleIndex, lessonIndex },
        }),
        invalidatesTags: ["StudentDashboard"],
      }),

      // Not used by a page yet: lets a future enrol flow refresh the dashboard automatically.
      enrollInCourse: build.mutation({
        query: (courseId) => ({ url: "/enrollments", method: "POST", data: { courseId } }),
        invalidatesTags: ["StudentDashboard", "StudentNotifications"],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetStudentDashboardQuery,
  useListStudentNotificationsQuery,
  useMarkNotificationReadMutation,
  useCompleteLessonMutation,
  useEnrollInCourseMutation,
} = studentApi;