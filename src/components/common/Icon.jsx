const PATHS = {
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  layers: "M12 2l10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  cpu: "M6 6h12v12H6zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  pen: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.59 7.59",
  globe: "M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z",
  briefcase: "M2 7h20v14H2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
  terminal: "M4 17l6-6-6-6M12 19h8",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  trending: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  folder: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  book: "M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15z",
  target: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
  cloud: "M16 16l-4-4-4 4M12 12v9M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3",
  arrow: "M5 12h14M12 5l7 7-7 7",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  monitor: "M2 3h20v14H2zM8 21h8M12 17v4",
  bars: "M4 20v-6M10 20V9M16 20V4"
};

export default function Icon({ name, size = 24, className = "", ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={PATHS[name] || PATHS.star} />
    </svg>
  );
}