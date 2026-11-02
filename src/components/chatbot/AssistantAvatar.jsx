import { memo } from "react";

/** The assistant's 3D identity: a glossy orb with a glass visor and two blinking eyes. Pure CSS, no images or libraries. */
function AssistantAvatar({ size = "md", online = false }) {
  return (
    <span className={`cb-avatar cb-avatar--${size}`} aria-hidden="true">
      <span className="cb-avatar__orb">
        <span className="cb-avatar__visor">
          <span className="cb-avatar__eye" />
          <span className="cb-avatar__eye" />
        </span>
      </span>
      {online && <span className="cb-avatar__dot" />}
    </span>
  );
}

export default memo(AssistantAvatar);