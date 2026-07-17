export const ease = [0.22, 1, 0.36, 1];

export const fadeUp = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: {
    duration: 0.8,
    ease,
  },
};

export const fadeDown = {
  initial: {
    opacity: 0,
    y: -25,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: {
    duration: 0.8,
    ease,
  },
};

export const fadeLeft = {
  initial: {
    opacity: 0,
    x: -40,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  transition: {
    duration: 0.8,
    ease,
  },
};

export const fadeRight = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  transition: {
    duration: 0.8,
    ease,
  },
};

export const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  transition: {
    duration: 0.7,
    ease,
  },
};