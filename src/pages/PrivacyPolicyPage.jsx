import LegalDocument from "../components/legal/LegalDocument";
import usePageSeo from "../hooks/usePageSeo";
import { legalPages } from "../data/legal";
import { ROUTES } from "../utils/constant";

export default function PrivacyPolicyPage() {
  const doc = legalPages.privacy;
  usePageSeo({ title: `${doc.title} | INVYN TECH`, description: doc.seoDescription, path: ROUTES.privacy });
  return <LegalDocument doc={doc} other={{ label: legalPages.terms.title, to: ROUTES.terms }} />;
}