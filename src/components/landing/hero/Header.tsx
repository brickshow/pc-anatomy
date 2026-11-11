"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Nav links used in both the desktop bar and the mobile menu
const NAV_LINKS = [
  { label: "PC Components", href: "/components" },
  { label: "Features", href: "#features" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Community", href: "#community" },
  { label: "GitHub", href: "https://github.com/brickshow/pc-anatomy", external: true },
];

// Header: the fixed top navigation bar with a logo, section links, and a
// hamburger menu for small screens.
export function Header() {
  // True once the user has scrolled a little, to style the bar
  const [scrolled, setScrolled] = useState(false);
  // True when the mobile menu is expanded
  const [open, setOpen] = useState(false);

  // Track scroll position so the bar can change its background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border px-5 py-2.5 transition-all duration-300 backdrop-blur-xl",
          scrolled
            ? "border-white/10 bg-[#0a0d14]/70 shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
            : "border-white/10 bg-white/[0.04]"
        )}
      >
        {/* Brand logo and name, linking back to the top of the page */}
        <a href="#" className="flex items-center gap-2.5" aria-label="Computer Anatomy home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Image src="/logo.png" alt="Computer Anatomy logo" width={28} height={28} className="rounded-md" />
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-white">
            Computer Anatomy
          </span>
        </a>

        {/* Desktop nav links (hidden on mobile) */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-3.5 py-2 text-[13.5px] text-neutral-400 transition-colors hover:text-accent-bright"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[13.5px] text-neutral-400 transition-colors hover:text-accent-bright"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Desktop "Explore" call-to-action button */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4.5 py-2.5 text-[13.5px] font-medium text-white backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:scale-[1.03] hover:border-accent/50 hover:bg-white/10"
          >
            Explore Project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Hamburger button toggles the mobile menu */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
        >
          <div className="space-y-1.5">
            <span className={cn("block h-0.5 w-4 rounded-full bg-white transition-transform", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-4 rounded-full bg-white transition-transform", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-4 rounded-full bg-white transition-transform", open && "-translate-y-2 -rotate-45")} />
          </div>
        </button>
      </nav>

      {/* Mobile dropdown menu, animated in/out when open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-4 top-[72px] mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#0a0d14]/90 p-2 backdrop-blur-xl md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-accent-bright"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/explore"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white backdrop-blur-xl"
            >
              Explore Project
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
