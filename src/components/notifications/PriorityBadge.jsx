import { isImportant, priorityLabel } from "../../utils/announcementFormat";

/** Text, not colour alone. Normal priority shows nothing. */
export default function PriorityBadge({ priority }) {
  if (!isImportant(priority)) return null;
  return <span className={`sd-badge nt-badge nt-badge--${priority}`}>{priorityLabel(priority)}</span>;
}