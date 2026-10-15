import { useState, useEffect } from 'react';

export const useEsMovil = (breakpoint = 768) => {
  const [esMovil, setEsMovil] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const check = () => setEsMovil(window.innerWidth < breakpoint);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return esMovil;
};