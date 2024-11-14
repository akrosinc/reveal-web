import React, { useEffect, useRef, useState } from 'react';
import styleClasses from './drawer.module.css';

interface DrawerProps {
  heading?: string;
  anchor: string;
  open: boolean;
  children: React.ReactNode;
}

export const Drawer = ({ children, open, anchor, heading }: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isOverFlowing, setIsOverFlowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (drawerRef.current) {
        setIsOverFlowing(drawerRef.current.scrollHeight > drawerRef.current.clientHeight);
      }
    };

    checkOverflow();

    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [children]);

  return (
    <>
      <div
        ref={drawerRef}
        className={`${styleClasses.customScroll} ${isOverFlowing ? styleClasses.scroll : ''}
          ${styleClasses.drawer} ${anchor === 'left' ? styleClasses.left : styleClasses.right}  ${
          open ? styleClasses.open : styleClasses.closed
        }`}
      >
        {heading && <div className={`${styleClasses.heading}`}>{heading}</div>}
        <div className={`${styleClasses.children}`}>{children}</div>
      </div>
    </>
  );
};
