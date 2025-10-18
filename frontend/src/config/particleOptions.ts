import type { ISourceOptions } from "@tsparticles/engine";

// Options adapted from the provided config to match the installed tsparticles v3 API.
export const particlesOptions = {
  fullScreen: { enable: false },
  background: {
    color: {
      value: "#0d47a1",
    },
  },
  fpsLimit: 60,
  particles: {
    color: { value: "#BAAE81" },
    links: {
      color: "#BAAE81",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: { enable: true },
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "bounce" },
      random: false,
      speed: 6,
      straight: false,
    },
    number: {
      density: { enable: true, area: 800 },
      value: 80,
    },
    opacity: { value: 0.5 },
  shape: { type: "star" },
    size: { random: true, value: 5 },
  },
  detectRetina: true,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab"
      },
    },
    modes: {
      grab: {
        distance: 100,
        links: {
          opacity: 0.5
        }
      },
    },
  },} as unknown as ISourceOptions;