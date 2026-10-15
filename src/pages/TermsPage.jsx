import LegalDocument from "../components/legal/LegalDocument";
import usePageSeo from "../hooks/usePageSeo";
import { legalPages } from "../data/legal";
import { ROUTES } from "../utils/constant";

export default function TermsPage() {
  const doc = legalPages.terms;
  usePageSeo({ title: `${doc.title} | INVYN TECH`, description: doc.seoDescription, path: ROUTES.terms });
  return <LegalDocument doc={doc} other={{ label: legalPages.privacy.title, to: ROUTES.privacy }} />;
}