import type { ISourceOptions } from "@tsparticles/engine";

// Options adapted from the provided config to match the installed tsparticles v3 API.
export const particlesOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  particles: {
    color: { value: "#E8D8A1" },
    links: {
      color: "#E8D8A1",
      distance: 150,
      enable: true,
      opacity: .8,
      width: 1,
    },
    collisions: { enable: true },
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "bounce" },
      random: false,
      speed: 1,
      straight: false,
    },
    number: {
      density: { enable: true, area: 800 },
      value: 80,
    },
    opacity: { value: .8 },
  shape: { type: "star" },
    size: { random: true, value: 3 },
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
          opacity: .8
        }
      },
    },
  },} as unknown as ISourceOptions;
