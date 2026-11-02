import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUploadCourseImageMutation } from "../../services/uploadApi";
import { assetUrl } from "../../utils/assetUrl";
import {
  IMAGE_TYPES,
  validateImageFile,
} from "../../utils/imageFile";
import { ROUTES } from "../../utils/constant";

export default function CourseRow({
  course,
  enrolled,
  onTogglePublish,
  onEdit,
  onDelete,
}) {
  const input = useRef(null);
  const [error, setError] = useState(null);

  const [uploadCourseImage, { isLoading: busy }] =
    useUploadCourseImageMutation();

  const live = course.status === "published";
  const imagePath = course.imageUrl;
  const imageSrc = assetUrl(imagePath);

  const onFile = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after an upload attempt.
    event.target.value = "";

    if (!file) return;

    const problem = validateImageFile(file);

    if (problem) {
      setError(problem);
      return;
    }

    setError(null);

    try {
      const result = await uploadCourseImage({
        courseId: course.id,
        file,
      }).unwrap();

      console.log("Course image upload result:", result);
    } catch (err) {
      console.error("Course image upload failed:", err);

      setError(
        err?.data?.message ||
          err?.message ||
          "The image could not be uploaded.",
      );
    }
  };

  return (
    <div
      className="inv-dash__course"
      style={{ flexWrap: "wrap" }}
    >
      <span
        style={{
          display: "flex",
          gap: ".75rem",
          alignItems: "center",
          minWidth: 0,
        }}
      >
        {imageSrc ? (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={`${course.title} course`}
            width="64"
            height="36"
            loading="lazy"
            onError={(event) => {
              console.error("Course image failed to load:", {
                courseId: course.id,
                title: course.title,
                imagePath,
                imageSrc,
              });

              event.currentTarget.style.visibility = "hidden";
            }}
            onLoad={() => {
              console.log("Course image loaded:", {
                courseId: course.id,
                imageSrc,
              });
            }}
            style={{
              objectFit: "cover",
              borderRadius: 6,
              flex: "0 0 auto",
              background: "#f1f5f9",
            }}
          />
        ) : (
          <span
            className="inv-admin__muted"
            style={{
              width: 64,
              height: 36,
              flex: "0 0 auto",
              fontSize: ".7rem",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            no image
          </span>
        )}

        <span className="inv-dash__meta">
          <span>{course.title}</span>

          <small>
            {enrolled} enrolled · {course.status}
            {live && (
              <>
                {" · "}
                <Link to={`${ROUTES.courses}/${course.slug}`}>
                  view on website
                </Link>
              </>
            )}
          </small>
        </span>
      </span>

      <span className="inv-admin__actions">
        <input
          ref={input}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          onChange={onFile}
          hidden
          aria-label={`Image for ${course.title}`}
        />

        <button
          type="button"
          className="inv-btn inv-btn--outline inv-btn--sm"
          onClick={() => onEdit(course)}
        >
          Edit
        </button>

        <button
          type="button"
          className="inv-btn inv-btn--outline inv-btn--sm"
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          {busy
            ? "Uploading…"
            : imagePath
              ? "Replace image"
              : "Upload image"}
        </button>

        <button
          type="button"
          className="inv-btn inv-btn--outline inv-btn--sm"
          onClick={() => onTogglePublish(course)}
        >
          {live ? "Unpublish" : "Publish"}
        </button>

        <button
          type="button"
          className="inv-btn inv-btn--outline inv-btn--sm inv-admin__danger"
          onClick={() => onDelete(course)}
        >
          Delete
        </button>
      </span>

      {error && (
        <p
          className="inv-form__error"
          role="alert"
          style={{
            flexBasis: "100%",
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}