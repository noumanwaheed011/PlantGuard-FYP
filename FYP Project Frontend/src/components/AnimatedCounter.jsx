import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Animates a number from 0 to target when in view. For values like "94%", "50K+".
 */
export default function AnimatedCounter({ value, label, delay = 0 }) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  const match = String(value).match(/^([\d,]+)(.*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  const suffix = match ? match[2] : ''; // "%", "K+", "+", etc.
  const duration = 2000;
  const steps = 60;
  const stepDuration = duration / steps;
  const increment = target / steps;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setDisplay(target);
              clearInterval(timer);
            } else {
              setDisplay(Math.floor(current));
            }
          }, stepDuration);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated, increment, stepDuration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.08 }}
      className="flex flex-col"
    >
      <span className="text-4xl sm:text-5xl md:text-6xl font-bold tabular-nums">
        {display >= 1000 ? Number(display).toLocaleString() : display}
        {suffix}
      </span>
      <span className="text-white/90 text-base sm:text-lg font-medium mt-2">{label}</span>
    </motion.div>
  );
}
