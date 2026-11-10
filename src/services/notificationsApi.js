import { dashboardApi } from "./dashboardApi";

export const notificationsApi = dashboardApi.enhanceEndpoints({ addTagTypes: ["Notifications", "Announcements", "StudentDashboard"] }).injectEndpoints({
  endpoints: (build) => ({
    // ---- student ----
    listMyNotifications: build.query({ query: (params) => ({ url: "/student/notifications", params }), transformResponse: (r) => r.data, providesTags: ["Notifications"] }),
    getUnreadNotificationCount: build.query({ query: () => ({ url: "/student/notifications/unread-count" }), transformResponse: (r) => r.data.unreadCount, providesTags: ["Notifications"] }),
    getNotificationDetail: build.query({ query: (id) => ({ url: `/student/notifications/${encodeURIComponent(id)}` }), transformResponse: (r) => r.data.notification }),
    markAllNotificationsRead: build.mutation({ query: () => ({ url: "/student/notifications/read-all", method: "PATCH", data: {} }), invalidatesTags: ["Notifications", "StudentDashboard"] }),
    getUpcomingEvents: build.query({ query: () => ({ url: "/student/events/upcoming" }), transformResponse: (r) => r.data, providesTags: ["Notifications"] }),

    // ---- staff (admin and employee) ----
    listAnnouncements: build.query({ query: (params) => ({ url: "/announcements", params }), transformResponse: (r) => r.data, providesTags: ["Announcements"] }),
    getAnnouncementOptions: build.query({ query: () => ({ url: "/announcements/options" }), transformResponse: (r) => r.data, providesTags: ["Announcements"] }),
    getAnnouncementStats: build.query({ query: (id) => ({ url: `/announcements/${encodeURIComponent(id)}/statistics` }), transformResponse: (r) => r.data.statistics, providesTags: ["Announcements"] }),
    createAnnouncement: build.mutation({ query: (body) => ({ url: "/announcements", method: "POST", data: body }), invalidatesTags: ["Announcements"] }),
    updateAnnouncement: build.mutation({ query: ({ id, ...body }) => ({ url: `/announcements/${encodeURIComponent(id)}`, method: "PATCH", data: body }), invalidatesTags: ["Announcements", "Notifications"] }),
    publishAnnouncement: build.mutation({ query: (id) => ({ url: `/announcements/${encodeURIComponent(id)}/publish`, method: "PATCH", data: {} }), invalidatesTags: ["Announcements", "Notifications"] }),
    archiveAnnouncement: build.mutation({ query: (id) => ({ url: `/announcements/${encodeURIComponent(id)}/archive`, method: "PATCH", data: {} }), invalidatesTags: ["Announcements", "Notifications"] }),
    deleteAnnouncement: build.mutation({ query: (id) => ({ url: `/announcements/${encodeURIComponent(id)}`, method: "DELETE" }), invalidatesTags: ["Announcements"] }),
  }),
  overrideExisting: false,
});

export const {
  useListMyNotificationsQuery, useGetUnreadNotificationCountQuery, useGetNotificationDetailQuery, useMarkAllNotificationsReadMutation, useGetUpcomingEventsQuery,
  useListAnnouncementsQuery, useGetAnnouncementOptionsQuery, useGetAnnouncementStatsQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation,
  usePublishAnnouncementMutation, useArchiveAnnouncementMutation, useDeleteAnnouncementMutation,
} = notificationsApi;