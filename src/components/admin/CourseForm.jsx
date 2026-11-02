
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import CourseCard from "../courses/CourseCard";
import useAllCourses from "../../hooks/useAllCourses";

import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "../../services/dashboardApi";

import { useUploadCourseImageMutation } from "../../services/uploadApi";
import { assetUrl } from "../../utils/assetUrl";

import {
  IMAGE_HELP,
  IMAGE_TYPES,
  validateImageFile,
} from "../../utils/imageFile";

import { toFormErrors } from "../../utils/authValidation";

import {
  formatFaqs,
  formatLines,
  formatModules,
  parseFaqs,
  parseLines,
  parseModules,
} from "../../utils/courseText";

import { ROUTES } from "../../utils/constant";

const MODES = ["Online", "Offline", "Online / Offline"];

const LEVELS = [
  "Beginner",
  "Beginner to Intermediate",
  "Intermediate",
  "Intermediate to Advanced",
  "Beginner to Advanced",
  "Advanced",
];

const UNITS = ["Weeks", "Months", "Years"];

const EMPTY = {
  title: "",
  shortTitle: "",
  category: "",
  durationValue: "",
  durationUnit: "Months",
  mode: "Online / Offline",
  level: "Beginner",
  technologies: "",
  description: "",
  fee: "",
  status: "published",
  eligibility: "",
  certificate: "",
  prerequisites: "",
  outcomes: "",
  projects: "",
  curriculum: "",
  faqs: "",
};

const KNOWN = [
  "title",
  "shortTitle",
  "category",
  "duration",
  "mode",
  "level",
  "technologies",
  "description",
  "fee",
  "status",
  "image",
  "eligibility",
  "certificate",
  "prerequisites",
  "outcomes",
  "projects",
  "curriculum",
  "faqs",
];

const parseTech = (value) =>
  [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

function fromCourse(course) {
  const match = String(course.duration ?? "").match(
    /^(\d+(?:\.\d+)?)\s*(week|month|year)s?$/i,
  );

  return {
    title: course.title ?? "",
    shortTitle: course.shortTitle ?? "",
    category: course.category ?? "",
    durationValue: match ? match[1] : "",
    durationUnit: match
      ? `${match[2][0].toUpperCase()}${match[2].slice(1).toLowerCase()}s`
      : "Months",
    mode: course.mode ?? "Online / Offline",
    level: course.level ?? "Beginner",
    technologies: (course.technologies ?? []).join(", "),
    description: course.description ?? "",
    fee: course.fee ?? "",
    status: course.status ?? "published",
    eligibility: course.eligibility ?? "",
    certificate: course.certificate ?? "",
    prerequisites: formatLines(course.prerequisites),
    outcomes: formatLines(course.outcomes),
    projects: formatLines(course.projects),
    curriculum: formatModules(course.curriculum),
    faqs: formatFaqs(course.faqs),
  };
}

function validate(values, file) {
  const errors = {};

  if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters long.";
  }

  if (values.shortTitle.trim().length > 40) {
    errors.shortTitle = "Short title must be 40 characters or fewer.";
  }

  if (values.category.trim().length < 2) {
    errors.category = "Enter a category, for example Programming.";
  }

  if (!(Number(values.durationValue) > 0)) {
    errors.duration = "Enter the course length, for example 6.";
  }

  const technologies = parseTech(values.technologies);

  if (technologies.length === 0) {
    errors.technologies =
      "Add at least one technology, separated by commas.";
  } else if (technologies.length > 8) {
    errors.technologies = "Add at most 8 technologies.";
  } else if (technologies.some((item) => item.length > 30)) {
    errors.technologies =
      "Each technology must be 30 characters or fewer.";
  }

  if (values.description.trim().length < 10) {
    errors.description =
      "Write a short description (at least 10 characters).";
  }

  if (
    values.fee !== "" &&
    !(Number.isInteger(Number(values.fee)) && Number(values.fee) >= 0)
  ) {
    errors.fee =
      "Fee must be a whole number of rupees, or leave it empty.";
  }

  if (values.eligibility.trim().length > 1000) {
    errors.eligibility = "Eligibility must be 1000 characters or fewer.";
  }

  if (values.certificate.trim().length > 500) {
    errors.certificate =
      "Certificate details must be 500 characters or fewer.";
  }

  const listLimits = {
    prerequisites: [10, 200],
    outcomes: [20, 250],
    projects: [10, 250],
  };

  const parsed = {};

  for (const [name, [maxItems, maxLength]] of Object.entries(listLimits)) {
    parsed[name] = parseLines(values[name]);

    if (parsed[name].length > maxItems) {
      errors[name] = `Add at most ${maxItems} lines.`;
    } else if (parsed[name].some((item) => item.length > maxLength)) {
      errors[name] = `Each line must be ${maxLength} characters or fewer.`;
    }
  }

  const modules = parseModules(values.curriculum);

  if (modules.error) {
    errors.curriculum = modules.error;
  } else {
    parsed.curriculum = modules.value;
  }

  const faqs = parseFaqs(values.faqs);

  if (faqs.error) {
    errors.faqs = faqs.error;
  } else {
    parsed.faqs = faqs.value;
  }

  const imageProblem = file ? validateImageFile(file) : null;

  if (imageProblem) {
    errors.image = imageProblem;
  }

  return { errors, parsed, tech: technologies };
}

/** Create a course or edit an existing course. */
export default function CourseForm({ course: editing, onCancel }) {
  const { courses } = useAllCourses();

  const [createCourse, { isLoading: creating }] =
    useCreateCourseMutation();

  const [updateCourse, { isLoading: updating }] =
    useUpdateCourseMutation();

  const [uploadCourseImage] = useUploadCourseImageMutation();

  const isLoading = creating || updating;
  const busy = useRef(false);
  const fileInput = useRef(null);

  const [values, setValues] = useState(() =>
    editing ? fromCourse(editing) : { ...EMPTY },
  );

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [done, setDone] = useState(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );


  const categories = useMemo(
    () =>
      [...new Set((courses ?? []).map((course) => course.category).filter(Boolean))]
        .sort(),
    [courses],
  );

  const technologies = parseTech(values.technologies);

  const duration = values.durationValue
    ? `${values.durationValue} ${values.durationUnit}`
    : "";

  const change = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setFormError(null);
  };

  const pickFile = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setDone(null);

    setErrors((current) => ({
      ...current,
      image: selectedFile
        ? validateImageFile(selectedFile) || undefined
        : undefined,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (busy.current) return;

    setFormError(null);
    setDone(null);

    const {
      errors: foundErrors,
      parsed,
      tech: parsedTechnologies,
    } = validate(values, file);

    setErrors(foundErrors);

    if (Object.values(foundErrors).some(Boolean)) {
      return;
    }

    busy.current = true;

    try {
      const body = {
        title: values.title.trim(),
        shortTitle: values.shortTitle.trim(),
        category: values.category.trim(),
        duration,
        mode: values.mode,
        level: values.level,
        technologies: parsedTechnologies,
        description: values.description.trim(),
        status: values.status,
        eligibility: values.eligibility.trim(),
        certificate: values.certificate.trim(),
        prerequisites: parsed.prerequisites,
        outcomes: parsed.outcomes,
        projects: parsed.projects,
        curriculum: parsed.curriculum,
        faqs: parsed.faqs,

        ...(editing
          ? { fee: values.fee === "" ? null : Number(values.fee) }
          : values.fee !== ""
            ? { fee: Number(values.fee) }
            : {}),
      };

      const saved = editing
        ? await updateCourse({
            id: editing.id,
            ...body,
          }).unwrap()
        : await createCourse(body).unwrap();

      let imageProblem = null;

      if (file) {
        try {
          await uploadCourseImage({
            courseId: saved.id,
            file,
          }).unwrap();
        } catch (uploadError) {
          imageProblem =
            uploadError?.data?.message ??
            "The image could not be uploaded.";
        }
      }

      setDone({
        title: saved.title,
        slug: saved.slug,
        status: saved.status,
        imageProblem,
        edited: Boolean(editing),
      });

      setFile(null);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      if (!editing) {
        setValues({ ...EMPTY });
      }
    } catch (error) {
      const result = toFormErrors(error);

      setErrors(result.fieldErrors ?? {});
      setFormError(
        result.formError ?? "Unable to save the course. Please try again.",
      );
    } finally {
      busy.current = false;
    }
  };

  const extra = Object.entries(errors).filter(
    ([key, message]) =>
      message && !KNOWN.includes(key.split(".")[0]),
  );

  const errFor = (name) =>
    errors[name] ||
    Object.entries(errors).find(
      ([key, message]) => message && key.startsWith(`${name}.`),
    )?.[1];

  const field = (name) => ({
    id: `cf-${name}`,
    name,
    value: values[name] ?? "",
    onChange: change,
    "aria-invalid": errFor(name) ? "true" : undefined,
    "aria-describedby": errFor(name) ? `cf-${name}-err` : undefined,
  });

  const err = (name) =>
    errFor(name) ? (
      <p id={`cf-${name}-err`} className="inv-form__error">
        {errFor(name)}
      </p>
    ) : null;

  return (
    <div>
      <form
        noValidate
        onSubmit={submit}
        className="inv-dash__panel inv-form"
        aria-label={editing ? "Edit course" : "Add course"}
      >
        <h2>{editing ? `Edit: ${editing.title}` : "Add a course"}</h2>

        <p className="inv-admin__muted">
          Published courses appear on the public Courses page straight away,
          in the same card design.
        </p>

        {editing && onCancel && (
          <button
            type="button"
            className="inv-btn inv-btn--outline inv-btn--sm"
            onClick={onCancel}
          >
            Stop editing / add a new course
          </button>
        )}

        {done && (
          <div className="inv-form__summary" role="status">
            <p>
              <strong>“{done.title}”</strong> was{" "}
              {done.edited ? "saved" : "added"}
              {done.status === "published"
                ? " and is live"
                : " as a draft (hidden from the website until you publish it)"}
              .{" "}
              {done.status === "published" && (
                <Link to={`${ROUTES.courses}/${done.slug}`}>
                  View it on the website
                </Link>
              )}
            </p>

            {done.imageProblem && (
              <p>
                The course was saved, but its image was not:{" "}
                {done.imageProblem}
              </p>
            )}
          </div>
        )}

        {formError && (
          <div className="inv-form__summary" role="alert">
            <p>{formError}</p>
          </div>
        )}

        {extra.length > 0 && (
          <div className="inv-form__summary" role="alert">
            {extra.map(([key, message]) => (
              <p key={key}>{message}</p>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: "1rem" }}>Card details</h3>

        <div className="inv-form__field">
          <label htmlFor="cf-title">Title *</label>
          <input
            className="inv-cf__control"
            maxLength={150}
            {...field("title")}
          />
          {err("title")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-shortTitle">
            Short title <small>(optional, used in menus and the chatbot)</small>
          </label>
          <input
            className="inv-cf__control"
            maxLength={40}
            {...field("shortTitle")}
          />
          {err("shortTitle")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-category">Category *</label>
          <input
            className="inv-cf__control"
            list="cf-categories"
            maxLength={40}
            {...field("category")}
          />
          <datalist id="cf-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          {err("category")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-durationValue">Duration *</label>
          <div style={{ display: "flex", gap: ".5rem" }}>
            <input
              className="inv-cf__control"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              aria-label="Duration number"
              {...field("durationValue")}
              aria-describedby={
                errors.duration ? "cf-duration-err" : undefined
              }
            />

            <select
              className="inv-cf__control"
              name="durationUnit"
              aria-label="Duration unit"
              value={values.durationUnit}
              onChange={change}
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          {err("duration")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-mode">Learning mode *</label>
          <select className="inv-cf__control" {...field("mode")}>
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-level">Level *</label>
          <select className="inv-cf__control" {...field("level")}>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-technologies">
            Technologies * <small>(comma separated, up to 8)</small>
          </label>
          <input
            className="inv-cf__control"
            placeholder="Python, Pandas, SQL"
            {...field("technologies")}
          />
          {err("technologies")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-description">Description *</label>
          <textarea
            className="inv-cf__control"
            rows={3}
            maxLength={2000}
            {...field("description")}
          />
          {err("description")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-fee">
            Fee in ₹{" "}
            <small>
              (optional, leave empty to show “Contact for fee details”)
            </small>
          </label>
          <input
            className="inv-cf__control"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            {...field("fee")}
          />
          {err("fee")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-image">
            Course image{" "}
            <small>
              (optional
              {editing?.imageUrl
                ? ", choose a file to replace the current one"
                : ""}
              )
            </small>
          </label>

          <input
            id="cf-image"
            ref={fileInput}
            className="inv-cf__control"
            type="file"
            accept={IMAGE_TYPES.join(",")}
            onChange={pickFile}
            aria-describedby="cf-image-help"
            aria-invalid={errors.image ? "true" : undefined}
          />

          <p id="cf-image-help" className="inv-form__hint">
            {IMAGE_HELP} Without an image, the card uses the site’s standard
            artwork.
          </p>

          {err("image")}

          {(previewUrl || editing?.imageUrl) && (
            <img
              src={
                previewUrl ||
                assetUrl(editing.imageUrl)
              }
              alt="Course image preview"
              style={{
                display: "block",
                width: "min(100%, 320px)",
                maxHeight: 180,
                objectFit: "cover",
                borderRadius: 10,
                marginTop: ".75rem",
              }}
            />
          )}
        </div>

        <h3 style={{ fontSize: "1rem", marginTop: "1rem" }}>
          Course page content
        </h3>

        <div className="inv-form__field">
          <label htmlFor="cf-outcomes">
            What you will learn <small>(one per line, up to 20)</small>
          </label>
          <textarea
            className="inv-cf__control"
            rows={5}
            {...field("outcomes")}
          />
          {err("outcomes")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-curriculum">
            Curriculum <small>(up to 20 modules)</small>
          </label>
          <textarea
            className="inv-cf__control"
            rows={10}
            placeholder={
              "Module 1: Foundations\nSetup and tools\nVariables and types\n\nModule 2: Projects\nPlanning\nBuilding"
            }
            {...field("curriculum")}
          />
          <p className="inv-form__hint">
            One module per block, separated by a blank line. First line =
            module title, the lines under it = topics.
          </p>
          {err("curriculum")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-projects">
            Practical projects <small>(one per line, up to 10)</small>
          </label>
          <textarea
            className="inv-cf__control"
            rows={4}
            {...field("projects")}
          />
          {err("projects")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-eligibility">Eligibility</label>
          <textarea
            className="inv-cf__control"
            rows={3}
            maxLength={1000}
            {...field("eligibility")}
          />
          {err("eligibility")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-prerequisites">
            Prerequisites <small>(one per line, up to 10)</small>
          </label>
          <textarea
            className="inv-cf__control"
            rows={3}
            {...field("prerequisites")}
          />
          {err("prerequisites")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-certificate">
            Certificate details <small>(optional)</small>
          </label>
          <textarea
            className="inv-cf__control"
            rows={2}
            maxLength={500}
            {...field("certificate")}
          />
          {err("certificate")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-faqs">
            FAQs <small>(up to 15)</small>
          </label>
          <textarea
            className="inv-cf__control"
            rows={7}
            placeholder={
              "Do I need experience?\nNo, we start from the basics.\n\nIs there a certificate?\nYes, on completion."
            }
            {...field("faqs")}
          />
          <p className="inv-form__hint">
            One FAQ per block, separated by a blank line. First line =
            question, the lines under it = answer.
          </p>
          {err("faqs")}
        </div>

        <div className="inv-form__field">
          <label htmlFor="cf-status">Visibility</label>
          <select className="inv-cf__control" {...field("status")}>
            <option value="published">
              Published (live on the website now)
            </option>
            <option value="draft">
              Draft (hidden from students and visitors)
            </option>
          </select>
        </div>

        <button
          type="submit"
          className="inv-btn inv-btn--primary"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading
            ? "Saving…"
            : editing
              ? "Save changes"
              : "Add course"}
        </button>
      </form>

      <section
        className="inv-dash__panel"
        aria-label="Card preview"
        style={{ marginTop: "1rem" }}
      >
        <h2>Preview</h2>

        <p className="inv-admin__muted">
          This is the real course card visitors will see.
        </p>

        <CourseCard
          interactive={false}
          tiltIntensity={0}
          course={{
            title: values.title.trim() || "Course title",
            description:
              values.description.trim() ||
              "Your course description appears here.",
            duration: duration || "Duration",
            mode: values.mode,
            level: values.level,
            category: values.category.trim() || "Category",
            technologies: technologies.length
              ? technologies
              : ["Technology"],
            image:
              previewUrl ||
              (editing?.imageUrl
                ? assetUrl(editing.imageUrl)
                : undefined),
            href: ROUTES.courses,
          }}
        />
      </section>
    </div>
  );
}
