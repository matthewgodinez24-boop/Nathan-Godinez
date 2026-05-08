"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  // Direction the element travels into place from
  from?: "up" | "down" | "left" | "right" | "fade";
  // px distance for slide-ins
  distance?: number;
};

export function ScrollReveal({
  children,
  delay = 0,
  className,
  from = "up",
  distance = 32,
}: Props) {
  const reduced = useReducedMotion();

  const offset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    fade: { x: 0, y: 0 },
  }[from];

  const variants: Variants = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, ...offset },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
            delay,
          },
        },
      };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
