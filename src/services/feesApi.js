import { dashboardApi } from "./dashboardApi";

const TAGS = ["Fees", "Payments", "FeeStructures"];
const refresh = TAGS.filter((t) => t !== "FeeStructures");

export const feesApi = dashboardApi.enhanceEndpoints({ addTagTypes: TAGS }).injectEndpoints({
  endpoints: (build) => ({
    // ---- student ----
    getStudentFeeSummary: build.query({ query: () => ({ url: "/student/fees/summary" }), transformResponse: (r) => r.data, providesTags: ["Fees"] }),
    getStudentFees: build.query({ query: (params) => ({ url: "/student/fees", params }), transformResponse: (r) => r.data, providesTags: ["Fees"] }),
    getStudentPayments: build.query({ query: (params) => ({ url: "/student/payments", params }), transformResponse: (r) => r.data, providesTags: ["Payments"] }),
    createPaymentOrder: build.mutation({
      query: (body) => ({ url: "/student/payments/create-order", method: "POST", data: body }),
      invalidatesTags: ["Payments"],
    }),
    verifyPayment: build.mutation({
      query: (body) => ({ url: "/student/payments/verify", method: "POST", data: body }),
      invalidatesTags: refresh,
    }),

    // ---- admin ----
    getAdminFees: build.query({ query: (params) => ({ url: "/admin/fees", params }), transformResponse: (r) => r.data, providesTags: ["Fees"] }),
    getAdminFee: build.query({ query: (id) => ({ url: `/admin/fees/${encodeURIComponent(id)}` }), transformResponse: (r) => r.data.fee, providesTags: ["Fees", "Payments"] }),
    adjustFee: build.mutation({ query: ({ id, ...body }) => ({ url: `/admin/fees/${encodeURIComponent(id)}`, method: "PATCH", data: body }), invalidatesTags: refresh }),
    getAdminPayments: build.query({ query: (params) => ({ url: "/admin/payments", params }), transformResponse: (r) => r.data, providesTags: ["Payments"] }),
    getAdminPayment: build.query({ query: (id) => ({ url: `/admin/payments/${encodeURIComponent(id)}` }), transformResponse: (r) => r.data.payment, providesTags: ["Payments"] }),
    recordManualPayment: build.mutation({ query: (body) => ({ url: "/admin/payments/manual", method: "POST", data: body }), invalidatesTags: refresh }),
    updatePayment: build.mutation({ query: ({ id, ...body }) => ({ url: `/admin/payments/${encodeURIComponent(id)}`, method: "PATCH", data: body }), invalidatesTags: refresh }),
    refundPayment: build.mutation({ query: ({ id, ...body }) => ({ url: `/admin/payments/${encodeURIComponent(id)}/refund`, method: "POST", data: body }), invalidatesTags: refresh }),
    getAdminFeeReport: build.query({ query: (params) => ({ url: "/admin/fees/reports", params }), transformResponse: (r) => r.data, providesTags: ["Fees", "Payments"] }),
    getFeeStructures: build.query({ query: (params) => ({ url: "/admin/fee-structures", params }), transformResponse: (r) => r.data, providesTags: ["FeeStructures"] }),
    createFeeStructure: build.mutation({ query: (body) => ({ url: "/admin/fee-structures", method: "POST", data: body }), invalidatesTags: ["FeeStructures"] }),
    updateFeeStructure: build.mutation({ query: ({ id, ...body }) => ({ url: `/admin/fee-structures/${encodeURIComponent(id)}`, method: "PATCH", data: body }), invalidatesTags: ["FeeStructures"] }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentFeeSummaryQuery, useGetStudentFeesQuery, useGetStudentPaymentsQuery, useCreatePaymentOrderMutation, useVerifyPaymentMutation,
  useGetAdminFeesQuery, useGetAdminFeeQuery, useAdjustFeeMutation, useGetAdminPaymentsQuery, useGetAdminPaymentQuery,
  useRecordManualPaymentMutation, useUpdatePaymentMutation, useRefundPaymentMutation, useGetAdminFeeReportQuery,
  useGetFeeStructuresQuery, useCreateFeeStructureMutation, useUpdateFeeStructureMutation,
} = feesApi;