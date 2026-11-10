import { dashboardApi } from "./dashboardApi";

export const materialsApi = dashboardApi
  .enhanceEndpoints({ addTagTypes: ["Materials", "MaterialCourses", "StudentMaterials"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listMaterials: build.query({
        query: (params) => ({ url: "/materials", params }),
        transformResponse: (response) => response.data,
        providesTags: ["Materials"],
      }),

      getMaterialCourses: build.query({
        query: () => ({ url: "/materials/courses" }),
        transformResponse: (response) => response.data.courses,
        providesTags: ["MaterialCourses"],
      }),

      // FormData: axios sets the multipart boundary itself, so no Content-Type is set by hand.
      createMaterial: build.mutation({
        query: (formData) => ({ url: "/materials", method: "POST", data: formData }),
        invalidatesTags: ["Materials", "StudentMaterials"],
      }),

      updateMaterial: build.mutation({
        query: ({ id, formData }) => ({ url: `/materials/${encodeURIComponent(id)}`, method: "PATCH", data: formData }),
        invalidatesTags: ["Materials", "StudentMaterials"],
      }),

      setMaterialStatus: build.mutation({
        query: ({ id, status }) => ({ url: `/materials/${encodeURIComponent(id)}/status`, method: "PATCH", data: { status } }),
        invalidatesTags: ["Materials", "StudentMaterials"],
      }),

      deleteMaterial: build.mutation({
        query: (id) => ({ url: `/materials/${encodeURIComponent(id)}`, method: "DELETE" }),
        invalidatesTags: ["Materials", "StudentMaterials"],
      }),
    }),
    overrideExisting: false,
  });

export const {
  useListMaterialsQuery,
  useGetMaterialCoursesQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useSetMaterialStatusMutation,
  useDeleteMaterialMutation,
} = materialsApi;