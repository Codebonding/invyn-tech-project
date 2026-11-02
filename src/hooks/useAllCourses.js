import { useCallback, useMemo } from "react";
import { toCardCourse } from "../utils/liveCourses";
import { useListPublicCoursesQuery } from "../services/publicCoursesApi";

/** Published courses from the database. */
export default function useAllCourses() {
  const { data, isLoading, isError } = useListPublicCoursesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000,       // pick up courses published or unpublished while a visitor is on the page
    skipPollingIfUnfocused: true, // no background requests from hidden tabs
  });
  const courses = useMemo(() => (data ?? []).map(toCardCourse), [data]);
  const getBySlug = useCallback((slug) => courses.find((c) => c.slug === slug) ?? null, [courses]);
  return { courses, getBySlug, isLoading, isError };
}