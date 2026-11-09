"use client";
import { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // cubic-bezier matching the old CSS
        delay: delay / 1000, // assuming incoming delay is in ms
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
