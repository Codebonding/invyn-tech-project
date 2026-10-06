export const animationConfig = {
  duration: { fast: 200, normal: 350, slow: 600, section: 800 },
  stagger: { small: 80, medium: 120, large: 180 },
  distance: { small: 12, medium: 24, large: 40 },
  marquee: { course: 30 },
  journey: { stepDelay: 450 },
};

export const staggerDelay = (index, step = animationConfig.stagger.small, max = 5) =>
  Math.min(index, max) * step;
export const courseTimeline = {
  touch: 480,        // hand reaches the card
  push: 640,         // hand presses, card starts to move
  switching: 900,    // character follows the new card
  success: 1300,     // smile and gesture
  idle: 1800,        // back to idle, marquee resumes
  cardMove: 1000,     // card slide duration
  backSuccess: 550,  // short path for "previous"
  backIdle: 900,
};