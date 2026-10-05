export const animationConfig = {
  duration: { fast: 200, normal: 350, slow: 600, section: 800 },
  stagger: { small: 80, medium: 120, large: 180 },
  distance: { small: 12, medium: 24, large: 40 },
  marquee: { course: 30 },
  journey: { stepDelay: 450 },
};

export const staggerDelay = (index, step = animationConfig.stagger.small, max = 5) =>
  Math.min(index, max) * step;