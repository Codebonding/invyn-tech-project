import EditableFieldsCard from "./EditableFieldsCard";
import { GENDERS, labelFor } from "../../../utils/profileOptions";
import { validatePersonal } from "../../../utils/profileValidation";
import { formatDate } from "../../../utils/studentFormat";

const todayIso = () => new Date().toISOString().slice(0, 10);

const FIELDS = [
  { key: "name", label: "Full name", required: true, maxLength: 100, autoComplete: "name" },
  { key: "email", label: "Email address", readOnly: true, hint: "Your email address cannot be changed here." },
  { key: "phone", label: "Phone number", type: "tel", maxLength: 20, autoComplete: "tel", hint: "Include the country code if you can." },
  { key: "dateOfBirth", label: "Date of birth", type: "date", max: todayIso(), format: formatDate, autoComplete: "bday" },
  { key: "gender", label: "Gender", as: "select", options: GENDERS, format: (v) => labelFor(GENDERS, v) },
  { key: "addressLine", label: "Address", maxLength: 200, autoComplete: "street-address" },
  { key: "city", label: "City", maxLength: 100, autoComplete: "address-level2" },
  { key: "state", label: "State", maxLength: 100, autoComplete: "address-level1" },
  { key: "country", label: "Country", maxLength: 100, autoComplete: "country-name" },
  { key: "postalCode", label: "Postal code", maxLength: 12, autoComplete: "postal-code" },
];

export default function PersonalInfoCard({ profile, editing, onEditingChange, onSave }) {
  return (
    <EditableFieldsCard
      id="personal"
      title="Personal information"
      fields={FIELDS}
      source={profile}
      validate={validatePersonal}
      onSave={onSave}
      editing={editing}
      onEditingChange={onEditingChange}
    />
  );
}