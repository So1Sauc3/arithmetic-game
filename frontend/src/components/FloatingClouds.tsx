import { useEffect, useState } from 'react';

interface Cloud {
  id: number;
  image: string;
  x: number;
  y: number;
  speed: number;
  direction: 'left' | 'right';
  size: number;
}

const cloudImages = ['./cloud1.svg', './cloud2.svg', './cloud3.svg', './cloud4.svg'];
const NUM_CLOUDS = 10; // Configurable number of clouds

export function FloatingClouds() {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Create a new cloud with random properties
  const createCloud = (startX?: number): Cloud => {
    const randomImage = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    // Distribute clouds across more vertical space
    const randomY = Math.random() * (screenHeight * 0.4) + (screenHeight * 0.6); // Bottom 40% of screen
    const randomSpeed = Math.random() * 0.5 + 0.2; // Speed between 0.2 and 0.7
    const direction = Math.random() > 0.5 ? 'left' : 'right';
    const randomSize = Math.random() * 300 + 400; // Random size between 300px and 500px
    
    return {
      id: Math.random(),
      image: randomImage,
      x: startX ?? (direction === 'right' ? -200 : screenWidth),
      y: randomY,
      speed: randomSpeed,
      direction,
      size: randomSize,
    };
  };

  // Initialize clouds
  useEffect(() => {
    const initialClouds = Array.from({ length: NUM_CLOUDS }, (_, index) => 
      createCloud(index * (screenWidth / NUM_CLOUDS))
    );
    setClouds(initialClouds);
    console.log('Initial clouds created:', initialClouds);
  }, [screenWidth]);

  // Animate clouds
  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setClouds(prevClouds => {
        return prevClouds.map(cloud => {
          const newX = cloud.direction === 'right' 
            ? cloud.x + cloud.speed 
            : cloud.x - cloud.speed;

          // If cloud goes off screen, create a new one from the opposite side
          if (
            (cloud.direction === 'right' && newX > screenWidth + 200) ||
            (cloud.direction === 'left' && newX < -200)
          ) {
            return createCloud();
          }

          return { ...cloud, x: newX };
        });
      });

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  console.log('Rendering clouds:', clouds); // Debug log

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {clouds.map(cloud => {
        console.log('Rendering cloud:', cloud); // Debug log
        return (
          <img
            key={cloud.id}
            src={cloud.image}
            alt="Cloud"
            className="absolute"
            style={{
              transform: `translate(${cloud.x}px, ${cloud.y}px)`,
              width: `${cloud.size}px`,
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
}