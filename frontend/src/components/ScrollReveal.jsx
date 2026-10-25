import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({
  children,
  animation = 'up', // 'up' | 'left' | 'right' | 'scale'
  delay = 0,
  className = '',
  threshold = 0.05,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Check immediately if already visible in viewport on mount
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin: '40px 0px 40px 0px',
      }
    );

    observer.observe(node);

    // Fallback timer: ensure element is never stuck hidden
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => {
      if (node) observer.unobserve(node);
      clearTimeout(timer);
    };
  }, [threshold]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'left':
        return 'reveal-left';
      case 'right':
        return 'reveal-right';
      case 'scale':
        return 'reveal-scale';
      case 'up':
      default:
        return 'reveal-init';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${getAnimationClass()} ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
