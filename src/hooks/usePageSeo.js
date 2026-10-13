import { useEffect } from "react";
import { applySeo } from "../utils/seo";

export default function usePageSeo({ title, description, path }, deps = []) {
  useEffect(() => {
    window.scrollTo(0, 0);
    applySeo({ title, description, canonical: `${window.location.origin}${path}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}