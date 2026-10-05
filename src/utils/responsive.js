export const breakpoints = { mobile: 576, tablet: 768, laptop: 992, desktop: 1200, wide: 1400 };

export const mq = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  belowTablet: `(max-width: ${breakpoints.tablet - 0.02}px)`,
  belowLaptop: `(max-width: ${breakpoints.laptop - 0.02}px)`,
  aboveLaptop: `(min-width: ${breakpoints.laptop}px)`,
};
