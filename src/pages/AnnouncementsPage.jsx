import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import {
  useArchiveAnnouncementMutation, useCreateAnnouncementMutation, useDeleteAnnouncementMutation, useGetAnnouncementOptionsQuery, useGetAnnouncementStatsQuery,
  useListAnnouncementsQuery, usePublishAnnouncementMutation, useUpdateAnnouncementMutation,
} from "../services/notificationsApi";
import { AUDIENCES, PRIORITIES, STATUSES } from "../utils/announcementFormat";
import { cleanParams } from "../utils/feeFormat";
import { ROUTES } from "../utils/constant";
import { serverMessage } from "../utils/profileValidation";
import AnnouncementForm from "../components/notifications/AnnouncementForm";
import AnnouncementsTable from "../components/notifications/AnnouncementsTable";
import AnnouncementStatsDialog from "../components/notifications/AnnouncementStatsDialog";
import ConfirmDialog from "../components/student/profile/ConfirmDialog";
import Pagination from "../components/student/courses/Pagination";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/notifications.css";

const PAGE_SIZE = 10;
const DEFAULTS = { courseId: "", targetAudience: "", status: "", priority: "" };

/** Admins manage every announcement; employees manage course announcements for their assigned courses (the API decides which). */
export default function AnnouncementsPage() {
  usePageSeo({ title: "Announcements | INVYN TECH", description: "Publish announcements.", path: ROUTES.staffAnnouncements }, []);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filters, setFilters] = useState(DEFAULTS);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | "new" | announcement
  const [confirm, setConfirm] = useState(null); // { kind: "archive" | "delete", item }
  const [statsFor, setStatsFor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { toasts, push } = useToasts();

  useEffect(() => { const t = setTimeout(() => { setSearch(searchText.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [searchText]);

  const list = useListAnnouncementsQuery({ ...cleanParams({ ...filters, search }), limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const optionsQuery = useGetAnnouncementOptionsQuery();
  const stats = useGetAnnouncementStatsQuery(statsFor?.id, { skip: !statsFor });
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [publishAnnouncement] = usePublishAnnouncementMutation();
  const [archiveAnnouncement] = useArchiveAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const options = optionsQuery.data || { courses: [], canTargetAll: false };
  const data = list.data;
  const change = (p) => { setFilters((f) => ({ ...f, ...p })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setSearchText(""); setSearch(""); setPage(1); };
  const active = Boolean(search || filters.courseId || filters.targetAudience || filters.status || filters.priority);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const submit = async (payload, { publish }) => {
    if (form === "new") {
      const created = await createAnnouncement(payload).unwrap();
      if (publish) await publishAnnouncement(created.data.announcement.id).unwrap();
      push(publish ? "Announcement published." : payload.scheduledAt ? "Announcement scheduled." : "Draft saved.");
    } else {
      await updateAnnouncement({ id: form.id, ...payload }).unwrap();
      push("Announcement updated.");
    }
    setForm(null);
  };

  const publishNow = async (a) => {
    setBusyId(a.id);
    try { await publishAnnouncement(a.id).unwrap(); push("Announcement published."); } catch (e) { push(serverMessage(e), "error"); } finally { setBusyId(null); }
  };
  const runConfirmed = async () => {
    const { kind, item } = confirm;
    setBusyId(item.id);
    try {
      if (kind === "archive") await archiveAnnouncement(item.id).unwrap(); else await deleteAnnouncement(item.id).unwrap();
      push(kind === "archive" ? "Announcement archived." : "Announcement deleted.");
    } catch (e) { push(serverMessage(e), "error"); } finally { setBusyId(null); setConfirm(null); }
  };

  return (
    <div className="inv-page"><Container><div className="sp mc nt">
      <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.account}>← Back to account</Link></nav>
      <header className="mc-header">
        <div><h1>Announcements</h1><p className="sd-muted">{isAdmin ? "Publish announcements to all students or to a course." : "Publish updates to the courses assigned to you."}</p></div>
        <button type="button" className="sd-btn sd-btn--primary" disabled={form !== null || (!options.canTargetAll && options.courses.length === 0)} onClick={() => setForm("new")}>New announcement</button>
      </header>
      {!isAdmin && optionsQuery.data && options.courses.length === 0 && <p className="sd-muted" role="status">No courses are assigned to you yet, so you cannot publish announcements.</p>}

      {form !== null && <AnnouncementForm key={form === "new" ? "new" : form.id} options={options} announcement={form === "new" ? null : form} onSubmit={submit} onCancel={() => setForm(null)} />}

      <div className="at-filters" role="search" aria-label="Announcement filters">
        <div className="sp-field at-filters__wide"><label htmlFor="an-search">Search by title</label><input id="an-search" type="search" className="sp-input" maxLength={100} value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
        <div className="sp-field"><label htmlFor="an-course">Course</label>
          <select id="an-course" className="sp-input" value={filters.courseId} onChange={(e) => change({ courseId: e.target.value })}><option value="">All courses</option>{options.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
        {isAdmin && <div className="sp-field"><label htmlFor="an-audience">Audience</label>
          <select id="an-audience" className="sp-input" value={filters.targetAudience} onChange={(e) => change({ targetAudience: e.target.value })}><option value="">All audiences</option>{AUDIENCES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></div>}
        <div className="sp-field"><label htmlFor="an-status">Status</label>
          <select id="an-status" className="sp-input" value={filters.status} onChange={(e) => change({ status: e.target.value })}><option value="">All statuses</option>{STATUSES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></div>
        <div className="sp-field"><label htmlFor="an-priority">Priority</label>
          <select id="an-priority" className="sp-input" value={filters.priority} onChange={(e) => change({ priority: e.target.value })}><option value="">All priorities</option>{PRIORITIES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></div>
        {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={clear}>Clear filters</button>}
      </div>

      <section aria-label="Announcements" aria-busy={list.isFetching} className={list.isFetching && data ? "mc-dim" : ""}>
        {list.isLoading ? <div role="status" aria-label="Loading announcements" className="sd-stack">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={2} />)}</div>
          : list.isError ? <ErrorState message={serverMessage(list.error, "We could not load the announcements.")} onRetry={list.refetch} />
          : data.total === 0 ? (active
            ? <EmptyState title="No announcements match your filters" action={<button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button>}>Try a different filter.</EmptyState>
            : <EmptyState title="No announcements yet">Create your first announcement to get started.</EmptyState>)
          : (<><AnnouncementsTable items={data.items} busyId={busyId} onEdit={setForm} onPublish={publishNow} onArchive={(item) => setConfirm({ kind: "archive", item })} onDelete={(item) => setConfirm({ kind: "delete", item })} onStats={setStatsFor} />
              <Pagination page={page} pageCount={pageCount} onPage={setPage} /></>)}
      </section>
    </div></Container>
      {statsFor && <AnnouncementStatsDialog title={statsFor.title} query={stats} onClose={() => setStatsFor(null)} />}
      <ConfirmDialog open={Boolean(confirm)} title={confirm?.kind === "delete" ? "Delete this announcement?" : "Archive this announcement?"}
        message={confirm ? (confirm.kind === "delete" ? `“${confirm.item.title}” will be permanently deleted.` : `“${confirm.item.title}” will disappear from students' notifications. You can still see it here.`) : ""}
        confirmLabel={confirm?.kind === "delete" ? "Delete" : "Archive"} busy={busyId === confirm?.item?.id} onConfirm={runConfirmed} onCancel={() => setConfirm(null)} />
      <Toasts toasts={toasts} />
    </div>
  );
}