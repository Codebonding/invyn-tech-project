import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

const LIST = { type: "Employee", id: "LIST" };

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Employee"],
  endpoints: (build) => ({
    listEmployees: build.query({
      query: (params) => ({ url: "/admin/employees", params }),
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result ? [LIST, ...result.employees.map(({ id }) => ({ type: "Employee", id }))] : [LIST],
    }),

    createEmployee: build.mutation({
      query: (body) => ({ url: "/admin/employees", method: "POST", data: body }),
      transformResponse: (response) => response.data, // { employee, invitation }
      invalidatesTags: [LIST],
    }),

    updateEmployee: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/employees/${id}`, method: "PATCH", data: body }),
      transformResponse: (response) => response.data.employee,
      invalidatesTags: (_res, _err, { id }) => [{ type: "Employee", id }],
    }),

    setEmployeeStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/admin/employees/${id}/status`, method: "PATCH", data: { status } }),
      transformResponse: (response) => response.data.employee,
      invalidatesTags: (_res, _err, { id }) => [{ type: "Employee", id }],
    }),

    resendInvitation: build.mutation({
      query: (id) => ({ url: `/admin/employees/${id}/invite`, method: "POST" }),
      transformResponse: (response) => response.data, // { employee, invitation }
      invalidatesTags: (_res, _err, id) => [{ type: "Employee", id }],
    }),
     deleteEmployee: build.mutation({
      query: (id) => ({ url: `/admin/employees/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [LIST, { type: "Employee", id }],
    }),
    setEmployeePermissions: build.mutation({
      query: ({ id, canManageCourses }) => ({ url: `/admin/employees/${id}/permissions`, method: "PATCH", data: { canManageCourses } }),
      transformResponse: (response) => response.data.employee,
      invalidatesTags: (_res, _err, { id }) => [{ type: "Employee", id }],
    }),


  
  }),
});

export const {
  useListEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useSetEmployeeStatusMutation,
  useResendInvitationMutation,
  useDeleteEmployeeMutation,
  useSetEmployeePermissionsMutation,
} = employeesApi;