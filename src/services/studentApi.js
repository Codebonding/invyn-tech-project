import { dashboardApi } from "./dashboardApi";
import { authApi } from "./authApi";

/** Name and avatar live in the cached session (/auth/me), so identity-changing mutations refresh it too. */
const refreshSession = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(authApi.util.invalidateTags(["CurrentUser"]));
  } catch {
    /* the mutation result already carries the error */
  }
};

const PROFILE_TAGS = ["StudentProfile", "StudentDashboard"];

/**
 * Student endpoints. They extend the existing dashboardApi (same base query, cookies and store entry),
 * so no new reducer or middleware is needed and logout already clears this cache.
 */
export const studentApi = dashboardApi
    .enhanceEndpoints({ addTagTypes: ["StudentDashboard", "StudentNotifications", "StudentProfile", "StudentEducation", "StudentCourses", "StudentCourse", "StudentMaterials"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // ---- dashboard ----
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
        invalidatesTags: ["StudentDashboard", "StudentCourses", "StudentCourse"],
      }),

      enrollInCourse: build.mutation({
        query: (courseId) => ({ url: "/enrollments", method: "POST", data: { courseId } }),
       invalidatesTags: ["StudentDashboard", "StudentNotifications", "StudentCourses"],
      }),

      // ---- profile ----
      getStudentProfile: build.query({
        query: () => ({ url: "/student/profile" }),
        transformResponse: (response) => response.data.profile,
        providesTags: ["StudentProfile"],
      }),

      updateStudentProfile: build.mutation({
        query: (body) => ({ url: "/student/profile", method: "PATCH", data: body }),
        invalidatesTags: PROFILE_TAGS,
        onQueryStarted: refreshSession,
      }),

      updateStudentAcademic: build.mutation({
        query: (body) => ({ url: "/student/profile/academic", method: "PATCH", data: body }),
        invalidatesTags: PROFILE_TAGS,
      }),

      uploadStudentAvatar: build.mutation({
        query: (file) => {
          const formData = new FormData();
          formData.append("avatar", file);
          return { url: "/student/profile/avatar", method: "POST", data: formData };
        },
        invalidatesTags: PROFILE_TAGS,
        onQueryStarted: refreshSession,
      }),

      deleteStudentAvatar: build.mutation({
        query: () => ({ url: "/student/profile/avatar", method: "DELETE" }),
        invalidatesTags: PROFILE_TAGS,
        onQueryStarted: refreshSession,
      }),
            // ---- my courses ----
      getMyCourses: build.query({
        query: (params) => ({ url: "/student/courses", params }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentCourses"],
      }),

      getMyCoursesSummary: build.query({
        query: () => ({ url: "/student/courses/summary" }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentCourses"],
      }),

      getStudentCourse: build.query({
        query: (courseId) => ({ url: `/student/courses/${encodeURIComponent(courseId)}` }),
        transformResponse: (response) => response.data.course,
        providesTags: (_r, _e, courseId) => [{ type: "StudentCourse", id: String(courseId) }],
      }),

      getCourseMaterials: build.query({
        query: (courseId) => ({ url: `/student/courses/${encodeURIComponent(courseId)}/materials` }),
        transformResponse: (response) => response.data,
        providesTags: (_r, _e, courseId) => [{ type: "StudentMaterials", id: String(courseId) }],
      }),

      // ---- education ----
      listStudentEducation: build.query({
        query: () => ({ url: "/student/profile/education" }),
        transformResponse: (response) => response.data,
        providesTags: ["StudentEducation"],
      }),

      createEducation: build.mutation({
        query: (body) => ({ url: "/student/profile/education", method: "POST", data: body }),
        invalidatesTags: ["StudentEducation"],
      }),

      updateEducation: build.mutation({
        query: ({ id, ...body }) => ({ url: `/student/profile/education/${encodeURIComponent(id)}`, method: "PATCH", data: body }),
        invalidatesTags: ["StudentEducation"],
      }),

      deleteEducation: build.mutation({
        query: (id) => ({ url: `/student/profile/education/${encodeURIComponent(id)}`, method: "DELETE" }),
        invalidatesTags: ["StudentEducation"],
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
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useUpdateStudentAcademicMutation,
  useUploadStudentAvatarMutation,
  useDeleteStudentAvatarMutation,
  useListStudentEducationQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useGetMyCoursesQuery,
  useGetMyCoursesSummaryQuery,
  useGetStudentCourseQuery,
  useGetCourseMaterialsQuery,
} = studentApi;