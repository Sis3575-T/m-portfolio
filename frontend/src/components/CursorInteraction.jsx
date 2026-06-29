import { useEffect, useRef } from 'react';

function CursorInteraction() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    const onMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
    };

    const ring = ringRef.current;
    if (ring) {
      const animate = () => {
        ringX += (mouseX - ringX) * 0.08;
        ringY += (mouseY - ringY) * 0.08;
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        requestAnimationFrame(animate);
      };
      animate();
    }

    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  return (
    <>
      <style>{`
        .cursor-dot, .cursor-ring {
          pointer-events: none;
          position: fixed;
          z-index: 99998;
          top: -4px;
          left: -4px;
          will-change: transform;
        }
        .cursor-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary-color);
          transition: opacity 0.2s;
        }
        .cursor-ring {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--primary-color);
          opacity: 0.3;
        }
        @media (pointer: coarse) {
          .cursor-dot, .cursor-ring { display: none; }
        }
      `}</style>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}

export default CursorInteraction;
