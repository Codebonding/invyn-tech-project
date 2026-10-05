export const breakpoints = { mobile: 576, tablet: 768, laptop: 992, desktop: 1200, wide: 1400, ultra: 1600  , wideUltra: 1800, ultraWide: 2000, ultraWidePlus: 2200, ultraWideMax: 2400 , ultraWideMaxPlus: 2600, ultraWideMaxPlusPlus: 2800, ultraWideMaxPlusPlusPlus: 3000, ultraWideMaxPlusPlusPlusPlus: 3200, ultraWideMaxPlusPlusPlusPlusPlus: 3400, ultraWideMaxPlusPlusPlusPlusPlusPlus: 3600, ultraWideMaxPlusPlusPlusPlusPlusPlusPlus: 3800};

export const mq = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  belowTablet: `(max-width: ${breakpoints.tablet - 0.02}px)`,
  belowLaptop: `(max-width: ${breakpoints.laptop - 0.02}px)`,
  aboveLaptop: `(min-width: ${breakpoints.laptop}px)`,
  
};
