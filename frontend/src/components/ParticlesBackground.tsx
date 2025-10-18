import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect } from "react";
import { particlesOptions } from "@/config/particleOptions";

// Ensure the engine has the slim features loaded. This should run once per app.
const ensureEngineLoaded = () => {
  initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  });
};

const ParticlesBackground = () => {
  useEffect(() => {
    ensureEngineLoaded();
  }, []);

  // Custom digits effect logic
  const handleParticlesLoaded = async (container: any) => {
    if (!container) return;
    let mouse = { x: 0, y: 0 };
    // Listen for mousemove on the canvas
    const canvas = container.canvas?.element;
    if (canvas) {
      canvas.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      canvas.addEventListener("mouseleave", () => {
        mouse.x = -10000;
        mouse.y = -10000;
      });
    }
    // Per-frame update
    const updateParticles = () => {
      const particles = container.particles.array;
      for (const particle of particles) {
        const dx = particle.position.x - mouse.x;
        const dy = particle.position.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          particle.shape = "char";
          (particle as any).text = Math.floor(Math.random() * 10).toString();
        } else {
          particle.shape = "star";
          delete (particle as any).text;
        }
      }
      requestAnimationFrame(updateParticles);
    };
    updateParticles();
  };

  return <Particles id="tsparticles" options={particlesOptions} particlesLoaded={handleParticlesLoaded} />;
};

export default ParticlesBackground;