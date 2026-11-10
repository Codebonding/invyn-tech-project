import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import {
  useCreateMaterialMutation, useDeleteMaterialMutation, useGetMaterialCoursesQuery,
  useListMaterialsQuery, useSetMaterialStatusMutation, useUpdateMaterialMutation,
} from "../services/materialsApi";
import { ROUTES } from "../utils/constant";
import { openPrivateFile } from "../utils/materialFile";
import { serverMessage } from "../utils/profileValidation";
import StatCard from "../components/student/StatCard";
import Pagination from "../components/student/courses/Pagination";
import ConfirmDialog from "../components/student/profile/ConfirmDialog";
import MaterialFilters from "../components/materials/MaterialFilters";
import MaterialForm from "../components/materials/MaterialForm";
import MaterialsTable from "../components/materials/MaterialsTable";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";

const PAGE_SIZE = 10;
const DEFAULTS = { courseId: "", moduleIndex: "", type: "", status: "", sort: "created_desc" };
const STATUS_MESSAGE = { published: "Material published.", draft: "Material moved to drafts.", archived: "Material archived." };

export default function StaffMaterialsPage() {
  usePageSeo({ title: "Learning materials | INVYN TECH", description: "Manage course learning materials.", path: ROUTES.staffMaterials }, []);
  const { user } = useAuth();

  const [filters, setFilters] = useState(DEFAULTS);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | "create" | the material being edited
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { toasts, push } = useToasts();

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchText.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const params = {
    sort: filters.sort, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE,
    ...(search && { search }),
    ...(filters.courseId && { courseId: filters.courseId }),
    ...(filters.moduleIndex !== "" && { moduleIndex: filters.moduleIndex }),
    ...(filters.type && { type: filters.type }),
    ...(filters.status && { status: filters.status }),
  };

  const list = useListMaterialsQuery(params);
  const coursesQuery = useGetMaterialCoursesQuery();
  const [createMaterial] = useCreateMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [setStatus] = useSetMaterialStatusMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const courses = coursesQuery.data || [];
  const data = list.data;
  const change = (partial) => { setFilters((f) => ({ ...f, ...partial })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setSearchText(""); setSearch(""); setPage(1); };
  const filtered = Boolean(search || filters.courseId || filters.moduleIndex || filters.type || filters.status);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  // The form shows field errors itself, so these only add a success toast and rethrow failures to the form.
  const submitForm = async (formData) => {
    if (form === "create") await createMaterial(formData).unwrap();
    else await updateMaterial({ id: form.id, formData }).unwrap();
    push(form === "create" ? "Material saved." : "Material updated.");
    setForm(null);
  };

  const changeStatus = async (material, status) => {
    setBusyId(material.id);
    try {
      await setStatus({ id: material.id, status }).unwrap();
      push(STATUS_MESSAGE[status]);
    } catch (e) {
      push(serverMessage(e), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await deleteMaterial(deleting.id).unwrap();
      push("Material deleted.");
    } catch (e) {
      push(serverMessage(e), "error");
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  };

  const open = (material) =>
    openPrivateFile(`/materials/${material.id}/file`, { params: { download: false }, fileName: material.fileName }).catch(() => push("Could not open this file.", "error"));

  const stats = data?.stats;

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc lm">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.account}>← Back to account</Link></nav>

          <header className="mc-header">
            <div>
              <h1>Learning Materials</h1>
              <p className="sd-muted">{user?.role === "admin" ? "Manage materials across all courses." : "Manage materials for the courses you created."}</p>
            </div>
            <button type="button" className="sd-btn sd-btn--primary" onClick={() => setForm("create")} disabled={form !== null || courses.length === 0}>Upload material</button>
          </header>

          <section className="sd-stats" aria-label="Materials summary">
            <StatCard label="Total materials" value={stats?.total ?? "–"} hint="In your scope" />
            <StatCard label="Published" value={stats?.published ?? "–"} hint="Visible to students" />
            <StatCard label="Draft" value={stats?.draft ?? "–"} hint="Not yet published" />
            <StatCard label="Archived" value={stats?.archived ?? "–"} hint="Hidden from students" />
          </section>

          {form !== null && (
            <MaterialForm key={form === "create" ? "create" : form.id} courses={courses} material={form === "create" ? null : form} onSubmit={submitForm} onCancel={() => setForm(null)} />
          )}

          <MaterialFilters value={filters} searchText={searchText} onSearchText={setSearchText} onChange={change} onClear={clear} courses={courses} />

          <section aria-label="Materials" aria-busy={list.isFetching} className={list.isFetching && data ? "mc-dim" : ""}>
            {list.isLoading ? (
              <div role="status" aria-label="Loading materials" className="sd-stack">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={2} />)}</div>
            ) : list.isError ? (
              <ErrorState message={serverMessage(list.error, "We could not load the materials.")} onRetry={list.refetch} />
            ) : data.total === 0 ? (
              filtered ? (
                <EmptyState title="No materials match your filters" action={<button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button>}>Try a different search or filter.</EmptyState>
              ) : (
                <EmptyState title="No learning materials yet">{courses.length === 0 ? "You do not manage any courses yet." : "Upload your first material to get started."}</EmptyState>
              )
            ) : (
              <>
                <MaterialsTable items={data.items} user={user || {}} busyId={busyId} onEdit={setForm} onStatus={changeStatus} onDelete={setDeleting} onOpen={open} />
                <Pagination page={page} pageCount={pageCount} onPage={setPage} />
              </>
            )}
          </section>
        </div>
      </Container>

      <ConfirmDialog open={Boolean(deleting)} title="Delete this material?" message={deleting ? `“${deleting.title}” and its file will be permanently removed. Students will lose access immediately.` : ""} busy={deleteBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      <Toasts toasts={toasts} />
    </div>
  );
}