import { dashboardApi } from "./dashboardApi";

export const uploadApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    uploadCourseImage: build.mutation({
      query: ({ courseId, file }) => {
        const formData = new FormData();
        formData.append("image", file);

        return {
          url: `/courses/${encodeURIComponent(courseId)}/image`,
          method: "POST",
          data: formData,
        };
      },

      invalidatesTags: ["Courses"],
    }),
  }),

  overrideExisting: false,
});

export const { useUploadCourseImageMutation } = uploadApi;