const SKIN = "#F2C6A0";
const SKIN_SH = "#D9A981";

/*
  Original stylised human, facing left. viewBox 160 x 300.
  Rig (all pivots in viewBox units):
    near shoulder (52,118) -> elbow (52.5,156) -> wrist (52.5,190)
    far shoulder  (108,118) -> elbow (108,156)
    hips (68,196) and (92,196) -> knees (68,240) and (92,240)
    neck (80,104), waist (80,200)
*/
export default function CourseCharacter({ phase = "idle" }) {
  return (
    <div className="inv-char" data-phase={phase} aria-hidden="true">
      <svg className="inv-char__svg" viewBox="0 0 160 300" role="presentation" focusable="false">
        <ellipse cx="80" cy="294" rx="38" ry="5" fill="rgba(0,0,0,.32)" />

        {/* pelvis */}
        <rect x="56" y="184" width="48" height="24" rx="11" fill="#0C1B2E" />

        {/* back leg */}
        <g className="inv-char__thigh inv-char__thigh-b">
          <rect x="83" y="190" width="18" height="52" rx="9" fill="#0A1626" />
          <g className="inv-char__shin inv-char__shin-b">
            <rect x="84.5" y="234" width="15" height="46" rx="7.5" fill="#0A1626" />
            <path d="M101 278 L101 289 Q101 291 99 291 L66 291 Q60 291 62 285 Q64 280 74 279 L88 277Z" fill="#DCE9F8" />
            <path d="M62 289.5 H101" stroke="#0B9AF0" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>

        {/* front leg */}
        <g className="inv-char__thigh inv-char__thigh-f">
          <rect x="59" y="190" width="18" height="52" rx="9" fill="#0E2036" />
          <g className="inv-char__shin inv-char__shin-f">
            <rect x="60.5" y="234" width="15" height="46" rx="7.5" fill="#0E2036" />
            <path d="M77 278 L77 289 Q77 291 75 291 L42 291 Q36 291 38 285 Q40 280 50 279 L64 277Z" fill="#FFFFFF" />
            <path d="M38 289.5 H77" stroke="#0B9AF0" strokeWidth="3" strokeLinecap="round" />
            <path d="M52 283 l5 -2 M56 286 l5 -2" stroke="#8CD6FF" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </g>

        {/* upper body (leans from the waist) */}
        <g className="inv-char__figure">
          {/* far arm */}
          <g className="inv-char__arm-far">
            <rect x="99.5" y="110" width="17" height="52" rx="8.5" fill="#0E2238" />
            <g className="inv-char__far-fore">
              <rect x="100.5" y="150" width="15" height="40" rx="7.5" fill="#0E2238" />
              <rect x="100.5" y="180" width="15" height="7" rx="3" fill="#0B9AF0" opacity=".8" />
              <circle cx="108" cy="196" r="7.5" fill={SKIN_SH} />
            </g>
          </g>

          {/* hoodie */}
          <g className="inv-char__torso">
            <path d="M52 112 Q80 99 108 112 L106 200 Q80 207 54 200Z" fill="#132C48" />
            <path d="M62 168 Q80 178 98 168 L100 191 Q80 197 60 191Z" fill="#0F2338" stroke="#1F4468" strokeWidth="1.4" />
            <rect x="54" y="197" width="52" height="9" rx="4" fill="#0B9AF0" />
            <path d="M74 118 V142 M87 118 V138" stroke="#8CD6FF" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="74" cy="143" r="2" fill="#8CD6FF" />
            <circle cx="87" cy="139" r="2" fill="#8CD6FF" />
            <path d="M58 118 Q64 150 60 190" stroke="#0B9AF0" strokeWidth="1.4" opacity=".5" fill="none" />
          </g>

          {/* head */}
          <g className="inv-char__head">
            <g className="inv-char__head-idle">
              <rect x="73" y="92" width="14" height="20" rx="5" fill={SKIN_SH} />
              <path d="M57 109 Q80 123 103 109" stroke="#0F2338" strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M60 111 Q80 124 100 111" stroke="#0B9AF0" strokeWidth="1.4" strokeLinecap="round" fill="none" />

              <ellipse cx="111" cy="68" rx="5" ry="7.5" fill="#E3B48E" />
              <path d="M110 65 Q113 68 110 72" stroke="#C98F68" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <ellipse cx="78" cy="64" rx="34" ry="35" fill={SKIN} />

              {/* hair */}
              <path d="M43 63 C38 28 62 20 80 22 C104 22 119 38 113 66 C110 51 102 42 92 41 C86 50 70 52 58 46 C50 50 46 56 43 63Z" fill="#0E1F36" />
              <path d="M72 24 Q78 11 91 18 Q83 22 81 28Z" fill="#0E1F36" />
              <path d="M52 44 Q66 30 90 36" stroke="#0B9AF0" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              <circle cx="55" cy="80" r="5" fill="#FF8F7A" opacity=".3" />
              <circle cx="97" cy="80" r="5" fill="#FF8F7A" opacity=".3" />

              <g className="inv-char__eyes">
                <ellipse cx="62" cy="67" rx="7" ry="8.5" fill="#fff" />
                <ellipse cx="88" cy="67" rx="6.2" ry="8" fill="#fff" />
                <g className="inv-char__pupils">
                  <circle cx="60.5" cy="68.5" r="4.6" fill="#132C48" />
                  <circle cx="86.5" cy="68.5" r="4.2" fill="#132C48" />
                  <circle cx="60.5" cy="68.5" r="2" fill="#050D18" />
                  <circle cx="86.5" cy="68.5" r="1.9" fill="#050D18" />
                  <circle cx="59" cy="66.4" r="1.6" fill="#fff" />
                  <circle cx="85" cy="66.4" r="1.5" fill="#fff" />
                </g>
              </g>
              <path d="M53 56 Q62 49 71 54 M81 54 Q89 49 96 56" stroke="#0E1F36" strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <path d="M72 77 Q69 82 74 83" stroke="#C98F68" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path className="inv-char__mouth" d="M64 87 Q75 94 86 87" stroke="#8A3F2B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <g className="inv-char__mouth-big">
                <path d="M62 85 Q75 102 88 85Z" fill="#7A2F20" />
                <path d="M68 93 Q75 98 82 93 Q75 90 68 93Z" fill="#E07A7A" />
              </g>
            </g>
          </g>

          {/* near arm: shoulder -> elbow -> wrist -> hand */}
          <g className="inv-char__arm-near">
            <rect x="44" y="110" width="17" height="52" rx="8.5" fill="#132C48" />
            <rect x="44" y="127" width="17" height="4" fill="#0B9AF0" />
            <g className="inv-char__forearm">
              <rect x="45" y="150" width="15" height="40" rx="7.5" fill="#132C48" />
              <rect x="45" y="180" width="15" height="7" rx="3" fill="#0B9AF0" />
              <g className="inv-char__hand">
                <rect x="45.5" y="187" width="14" height="17" rx="6.5" fill={SKIN} />
                <ellipse cx="44" cy="194" rx="3.4" ry="6" fill={SKIN} transform="rotate(14 44 194)" />
                <path d="M49 199 V203 M53 199 V203 M57 199 V203" stroke="#C98F68" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}