import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export default function useCourseFilters(options) {
  const [params, setParams] = useSearchParams();
  const pick = (key, allowed) => {
    const v = params.get(key) || "";
    return !v || allowed.includes(v) ? v : "";
  };
  const filters = {
    q: params.get("q") || "",
    category: pick("category", options.categories),
    mode: pick("mode", options.modes),
    duration: pick("duration", options.durations.map((d) => d.value)),
    sort: pick("sort", options.sorts.map((s) => s.value)) || "default",
  };
  const set = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => (!v || v === "default" ? next.delete(k) : next.set(k, v)));
      setParams(next, { replace: true });
    },
    [params, setParams]
  );
  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);
  const dirty = Boolean(filters.q || filters.category || filters.mode || filters.duration || filters.sort !== "default");
  return { filters, set, clear, dirty };
}