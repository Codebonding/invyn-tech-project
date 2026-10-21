import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

export const enquiryApi = createApi({
  reducerPath: "enquiryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Enquiry"],
  endpoints: (build) => ({
    // Public: used by the chatbot form.
    createEnquiry: build.mutation({
      query: (body) => ({ url: "/enquiries", method: "POST", data: body }),
      transformResponse: (r) => r.data,
    }),
    // Admin only (enforced by the server).
    listEnquiries: build.query({
      query: (params) => ({ url: "/enquiries", params }),
      transformResponse: (r) => r.data,
      providesTags: ["Enquiry"],
    }),
    updateEnquiryStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/enquiries/${id}/status`, method: "PATCH", data: { status } }),
      invalidatesTags: ["Enquiry"],
    }),
  }),
});

export const { useCreateEnquiryMutation, useListEnquiriesQuery, useUpdateEnquiryStatusMutation } = enquiryApi;