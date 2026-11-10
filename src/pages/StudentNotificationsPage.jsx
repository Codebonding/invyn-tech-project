import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useGetNotificationDetailQuery, useGetUpcomingEventsQuery, useListMyNotificationsQuery, useMarkAllNotificationsReadMutation } from "../services/notificationsApi";
import { useMarkNotificationReadMutation } from "../services/studentApi";
import { CATEGORIES } from "../utils/announcementFormat";
import { cleanParams } from "../utils/feeFormat";
import { ROUTES } from "../utils/constant";
import { serverMessage } from "../utils/profileValidation";
import { formatSessionDay, formatTime } from "../utils/studentFormat";
import NotificationItem from "../components/notifications/NotificationItem";
import NotificationDetailDialog from "../components/notifications/NotificationDetailDialog";
import Pagination from "../components/student/courses/Pagination";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/notifications.css";

const PAGE_SIZE = 10;
const TABS = [["all", "All"], ["unread", "Unread"], ["read", "Read"]];
const DEFAULTS = { read: "all", courseId: "", category: "" };

export default function StudentNotificationsPage() {
  usePageSeo({ title: "Notifications | INVYN TECH", description: "Your notifications and announcements.", path: ROUTES.studentNotifications }, []);
  const [filters, setFilters] = useState(DEFAULTS);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { toasts, push } = useToasts();

  const list = useListMyNotificationsQuery({ ...cleanParams(filters), limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const events = useGetUpcomingEventsQuery();
  const detail = useGetNotificationDetailQuery(openId, { skip: !openId });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, markAllState] = useMarkAllNotificationsReadMutation();

  const data = list.data;
  const change = (p) => { setFilters((f) => ({ ...f, ...p })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setPage(1); };
  const active = Boolean(filters.read !== "all" || filters.courseId || filters.category);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const unread = data?.unreadCount ?? 0;

  const read = async (id) => {
    setBusyId(id);
    try { await markRead(id).unwrap(); } catch (e) { push(serverMessage(e), "error"); } finally { setBusyId(null); }
  };
  const open = (item) => { setOpenId(item.id); if (!item.read) read(item.id); }; // opening the details counts as reading
  const readAll = async () => {
    try { await markAll().unwrap(); push("All notifications marked as read."); } catch (e) { push(serverMessage(e), "error"); }
  };

  return (
    <div className="inv-page"><Container><div className="sp mc nt">
      <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.studentDashboard}>← Back to dashboard</Link></nav>
      <header className="mc-header">
        <div><h1>Notifications {unread > 0 && <span className="sd-count" aria-label={`${unread} unread`}>{unread}</span>}</h1><p className="sd-muted">Announcements and updates from your institute and courses.</p></div>
        <button type="button" className="sd-btn sd-btn--primary" disabled={unread === 0 || markAllState.isLoading} onClick={readAll}>{markAllState.isLoading ? "Marking…" : "Mark all as read"}</button>
      </header>

      <div className="nt-layout">
        <div>
          <div className="sd-filters" role="group" aria-label="Read status">
            {TABS.map(([id, label]) => <button key={id} type="button" className={`sd-chip ${filters.read === id ? "is-active" : ""}`} aria-pressed={filters.read === id} onClick={() => change({ read: id })}>{label}</button>)}
          </div>
          <div className="at-filters" role="search" aria-label="Notification filters">
            <div className="sp-field"><label htmlFor="nf-course">Course</label>
              <select id="nf-course" className="sp-input" value={filters.courseId} onChange={(e) => change({ courseId: e.target.value })}>
                <option value="">All courses</option>{(data?.courses || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select></div>
            <div className="sp-field"><label htmlFor="nf-category">Type</label>
              <select id="nf-category" className="sp-input" value={filters.category} onChange={(e) => change({ category: e.target.value })}>
                <option value="">All types</option>{CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select></div>
            {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={clear}>Clear filters</button>}
          </div>

          <section aria-label="Notifications" aria-busy={list.isFetching} className={list.isFetching && data ? "mc-dim" : ""}>
            {list.isLoading ? <div role="status" aria-label="Loading notifications" className="sd-stack">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={2} />)}</div>
              : list.isError ? <ErrorState message={serverMessage(list.error, "We could not load your notifications.")} onRetry={list.refetch} />
              : data.total === 0 ? (
                <EmptyState title={active ? "No notifications match your filters" : "You are all caught up"} action={active ? <button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button> : undefined}>
                  {active ? "Try a different filter." : "New announcements and updates will appear here."}
                </EmptyState>
              ) : (
                <><ul className="sd-card nt-list">{data.items.map((n) => <NotificationItem key={n.id} item={n} busy={busyId === n.id} onRead={read} onOpen={open} />)}</ul>
                  <Pagination page={page} pageCount={pageCount} onPage={setPage} /></>
              )}
          </section>
        </div>

        <aside className="sd-card sp-section" aria-label="Upcoming events">
          <div className="sp-section__head"><h2>Upcoming events</h2></div>
          {events.isLoading ? <CardSkeleton lines={3} /> : events.isError ? <p className="sd-muted" role="alert">Events could not be loaded.</p>
            : events.data.items.length === 0 ? <p className="sd-muted">No upcoming classes or events.</p>
            : <ul className="sd-list">{events.data.items.map((s) => (
              <li key={s.id}><p className="sd-timeline__title">{s.title}</p>
                <p className="sd-muted">{s.courseTitle} · {formatSessionDay(s.startsAt)}, {formatTime(s.startsAt)}</p>
                {s.meetingUrl && <a className="sd-btn sd-btn--sm" href={s.meetingUrl} target="_blank" rel="noopener noreferrer">Join<span className="visually-hidden"> {s.title}</span></a>}</li>))}</ul>}
        </aside>
      </div>
    </div></Container>
      {openId && <NotificationDetailDialog query={detail} onClose={() => setOpenId(null)} />}
      <Toasts toasts={toasts} />
    </div>
  );
}