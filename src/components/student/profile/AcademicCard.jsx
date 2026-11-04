import { useState } from "react";
import EditableFieldsCard from "./EditableFieldsCard";
import { ACADEMIC_STATUSES, labelFor } from "../../../utils/profileOptions";
import { validateAcademic } from "../../../utils/profileValidation";

const FIELDS = [
  { key: "collegeName", label: "College / Institution", maxLength: 150 },
  { key: "department", label: "Department", maxLength: 150 },
  { key: "degreeProgram", label: "Degree / Program", maxLength: 150 },
  { key: "universityName", label: "University", maxLength: 150 },
  { key: "graduationYear", label: "Graduation year", type: "number", min: 1950, max: new Date().getFullYear() + 10 },
  { key: "academicStatus", label: "Current academic status", as: "select", options: ACADEMIC_STATUSES, format: (v) => labelFor(ACADEMIC_STATUSES, v) },
];

/** College and department details. These describe the student only: course assignments and enrollments are not touched. */
export default function AcademicCard({ academic, onSave }) {
  const [editing, setEditing] = useState(false);

  const save = (values) =>
    onSave({ ...values, graduationYear: values.graduationYear === "" ? null : Number(values.graduationYear) });

  return (
    <EditableFieldsCard
      id="academic"
      title="College & department"
      fields={FIELDS}
      source={academic}
      validate={validateAcademic}
      onSave={save}
      editing={editing}
      onEditingChange={setEditing}
    />
  );
}