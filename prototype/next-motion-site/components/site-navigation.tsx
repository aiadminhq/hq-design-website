"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function SiteNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="site-nav">
        <Link className="brand" href="/">HQ<span>DESIGN</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/projects">Projects</Link>
          <Link href="/#process">Process</Link>
          <Link href="/#about">About</Link>
        </nav>
        <button className="menu-button" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.nav initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: 24 }} transition={{ delay: 0.08 }} aria-label="Mobile navigation">
              <Link href="/projects" onClick={() => setOpen(false)}>Projects</Link>
              <Link href="/#process" onClick={() => setOpen(false)}>Process</Link>
              <Link href="/#about" onClick={() => setOpen(false)}>About</Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
