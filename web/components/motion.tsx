"use client";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { hqMotion } from "../lib/motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduce ? {} : { opacity: [0.65, 1], y: [12, 0] }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: hqMotion.duration.standard,
        ease: hqMotion.ease.brand,
      }}
    >
      {children}
    </motion.div>
  );
}
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  useEffect(() => {
    function selectJob(event: MouseEvent) {
      const link = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-position]",
      );
      const select = document.querySelector<HTMLSelectElement>(
        '#apply-form select[name="position"]',
      );
      if (link?.dataset.position && select)
        select.value = link.dataset.position;
    }
    document.addEventListener("click", selectJob);
    return () => document.removeEventListener("click", selectJob);
  }, []);
  return (
    <motion.main
      id="main-content"
      key={pathname}
      initial={false}
      animate={reduce ? {} : { opacity: [0.85, 1] }}
      transition={{ duration: hqMotion.duration.micro }}
    >
      {children}
    </motion.main>
  );
}
