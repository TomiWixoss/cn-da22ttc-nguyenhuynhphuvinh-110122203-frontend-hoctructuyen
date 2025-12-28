"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Khi component unmount, set mounted về false
    return () => setMounted(false);
  }, []);

  // Chỉ render portal ở phía client (sau khi đã mount)
  // và khi document.body đã tồn tại.
  return mounted ? createPortal(children, document.body) : null;
};

export default Portal;
